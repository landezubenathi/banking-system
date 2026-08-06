function AccountCard({ account, onSelect, onToggleStatus }) {

    return (

        <div className="account-card">

            <h2>Account Number: {account.account_number}</h2>

            <h1>R {account.balance}</h1>

            <p>
                Status:
                <span
                    className={
                        account.status === "ACTIVE"
                            ? "ACTIVE"
                            : "FROZEN"
                    }
                >
                    {" "}{account.status}
                </span>
            </p>

            
            <button
                className="primary-btn"
                onClick={() =>
                    handleToggleStatus(account.account_id)
                }
            >
                {account.status === "ACTIVE"
                    ? "Freeze Account"
                    : "Unfreeze Account"}
            </button>

        </div>

    );

}

export default AccountCard;