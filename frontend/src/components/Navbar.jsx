function Navbar({ user }) {

    const today = new Date().toLocaleDateString();

    return (

        <div className="navbar">

            <h2>Welcome, {user.full_name}</h2>

            <p>{today}</p>

        </div>

    );

}

export default Navbar;