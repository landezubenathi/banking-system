"""Offline unit tests; no Azure SQL connection or Flask server is required."""
import sys
import types
import unittest
from pathlib import Path
from unittest.mock import MagicMock

# transaction_service imports db.get_connection at module import time.
# Provide an isolated stub so local CI can run without the pyodbc driver.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
fake_db = types.ModuleType("db")
fake_db.get_connection = MagicMock()
sys.modules["db"] = fake_db
from services import transaction_service as svc  # noqa: E402

class AccountNumberTransferTests(unittest.TestCase):
    def setUp(self):
        svc.get_connection.reset_mock()

    def test_rejects_id_instead_of_account_number(self):
        result = svc.transfer("7", "1000000008", 10)
        self.assertEqual(result["status"], "error")
        svc.get_connection.assert_not_called()

    def test_rejects_number_as_python_int(self):
        result = svc.transfer(1000000007, "1000000008", 10)
        self.assertEqual(result["status"], "error")
        svc.get_connection.assert_not_called()

    def test_rejects_same_number(self):
        result = svc.transfer("1000000007", "1000000007", 10)
        self.assertIn("same", result["message"].lower())
        svc.get_connection.assert_not_called()

    def test_rejects_excessive_precision_and_nan(self):
        self.assertEqual(svc.transfer("1000000007", "1000000008", "10.001")["status"], "error")
        self.assertEqual(svc.transfer("1000000007", "1000000008", "NaN")["status"], "error")
        svc.get_connection.assert_not_called()

    def test_accepts_digit_strings_with_leading_zero(self):
        conn = MagicMock()
        svc.get_connection.return_value = conn
        result = svc.transfer("01234567", "1000000008", "20.00")
        self.assertEqual(result["status"], "success")
        parameters = conn.cursor.return_value.execute.call_args.args[1]
        self.assertEqual(parameters[0], "01234567")
        self.assertEqual(parameters[1], "1000000008")
        self.assertEqual(str(parameters[2]), "20.00")
        conn.commit.assert_called_once()
        conn.close.assert_called_once()

    def test_rolls_back_on_sql_error(self):
        conn = MagicMock()
        conn.cursor.return_value.execute.side_effect = RuntimeError("SQL error")
        svc.get_connection.return_value = conn
        result = svc.transfer("1000000007", "1000000008", 20)
        self.assertEqual(result["status"], "error")
        conn.rollback.assert_called_once()
        conn.close.assert_called_once()

if __name__ == "__main__":
    unittest.main()
