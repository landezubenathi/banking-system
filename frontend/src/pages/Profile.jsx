import { useEffect, useState } from "react";
import API from "../services/api";
import { useTheme } from "../context/ThemeContext";

import "../styles/profile.css";

function Profile() {

    const user = JSON.parse(localStorage.getItem("user"));

    const { darkMode, toggleTheme } = useTheme();

    const [profile, setProfile] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [recentTransactions, setRecentTransactions] = useState([]);

    const [editing, setEditing] = useState(false);

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        phone_number: ""
    });

    useEffect(() => {
        loadProfile();
        loadAccounts();
        loadRecentTransactions();
    }, []);

    const loadProfile = async () => {
        try {
            const response = await API.get(
                `/profile/${user.customer_id}`
            );
            setProfile(response.data);
            setForm({
                full_name: response.data.full_name,
                email: response.data.email,
                phone_number: response.data.phone_number
            });
        } catch (error) {
            console.error(error);
        }
    };

    const loadAccounts = async () => {
        try {
            const response = await API.get(
                `/accounts/${user.customer_id}`
            );
            setAccounts(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const loadRecentTransactions = async () => {
        try {
            const response = await API.get(
                `/recent-transactions/${user.customer_id}`
            );
            setRecentTransactions(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const saveProfile = async () => {
        try {
            const response = await API.put("/profile", {
                customer_id: user.customer_id,
                full_name: form.full_name,
                email: form.email,
                phone_number: form.phone_number
            });
            alert(response.data.message);
            setEditing(false);
            loadProfile();
        } catch (error) {
            console.error(error);
            alert("Failed to update profile");
        }
    };

    if (!profile) {
        return <h2>Loading...</h2>;
    }

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-avatar">
                    {profile.full_name.charAt(0)}
                </div>

                <h2>{profile.full_name}</h2>

                <p>@{profile.username}</p>
                <hr />
                <div className="profile-info">
                    <label>Full Name</label>
                    {editing ? (
                        <input
                            value={form.full_name}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    full_name: e.target.value
                                })
                            }
                        />
                    ) : (
                        <p>{profile.full_name}</p>
                    )}

                    <label>Email</label>
                    {editing ? (
                        <input
                            value={form.email}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    email: e.target.value
                                })
                            }
                        />
                    ) : (
                        <p>{profile.email}</p>
                    )}

                    <label>Phone Number</label>

                    {editing ? (

                        <input
                            value={form.phone_number}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    phone_number: e.target.value
                                })
                            }
                        />

                    ) : (

                        <p>{profile.phone_number}</p>

                    )}

                    <label>Account Number</label>
                    <p>{accounts.length > 0 ? accounts[0].account_number : "N/A"}</p>

                    <label>Username</label>
                    <p>{profile.username}</p>
                </div>
                <hr />
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginBottom: "20px"
                    }}
                >
                    {editing ? (
                        <button
                            className="primary-btn"
                            onClick={saveProfile}
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button
                            className="primary-btn"
                            onClick={() => setEditing(true)}
                        >
                            Edit Profile
                        </button>
                    )}
                    {/* Theme Toggle Button 
                    <button
                        className="primary-btn"
                        onClick={toggleTheme}
                    >
                        {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
                    </button>
                    */}
                </div>
                <hr />
                <h3>My Accounts</h3>
                <div className="accounts-summary">
                    {accounts.map(account => (
                        <div
                            key={account.account_id}
                            className="summary-card"
                        >
                            <h4>Account Number: {account.account_number}</h4>
                            <p>
                                Balance:
                                <strong>
                                    {" "}R {Number(account.balance).toFixed(2)}
                                </strong>
                            </p>
                            <p>
                                Status:
                                {" "}
                                <strong>{account.status}</strong>
                            </p>
                        </div>
                    ))}
                </div>
                <hr />
                <h3>Recent Activity</h3>
                <table className="activity-table">
                    <thead>
                        <tr>
                            <th>Account</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentTransactions.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="4"
                                    style={{ textAlign: "center" }}
                                >
                                    No recent transactions
                                </td>
                            </tr>
                        ) : (
                            recentTransactions.map(transaction => (

                                <tr key={transaction.transaction_id}>
                                    <td>#{accounts.find(a => a.account_id === transaction.account_id)?.account_number}</td>
                                    <td>{transaction.type}</td>
                                    <td>
                                        R {Number(transaction.amount).toFixed(2)}
                                    </td>
                                    <td>
                                        {new Date(transaction.date).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Profile;