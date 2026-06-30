function AccountCard({ account }) {

    return (

        <div className="account-card">

            <h2>Account #{account.account_id}</h2>

            <h1>R {account.balance}</h1>

            <p>
                Status:
                <span
                    className={
                        account.status === "ACTIVE"
                            ? "active"
                            : "frozen"
                    }
                >
                    {" "}{account.status}
                </span>
            </p>

        </div>

    );

}

export default AccountCard;