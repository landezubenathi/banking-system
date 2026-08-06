import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

import "../styles/forms.css";


function Register(){

    const navigate = useNavigate();


    const [form,setForm] = useState({

        full_name:"",
        email:"",
        phone:"",
        username:"",
        password:""

    });


    const [message,setMessage] = useState("");



    const handleChange=(e)=>{

        setForm({

            ...form,
            [e.target.name]: e.target.value

        });

    };



    const handleRegister = async(e)=>{

        e.preventDefault();


        try{

            const response = await API.post(
                "/register",
                form
            );


            console.log(response.data);


            if(response.data.status==="success"){

                setMessage(
                    "Account created successfully"
                );


                setTimeout(()=>{

                    navigate("/login");

                },1500);


            }
            else{

                setMessage(
                    response.data.message
                );

            }


        }
        catch(error){

            console.error(error);

            setMessage(
                "Registration failed"
            );

        }

    };



return(

  <div className="page-container">


    <div className="form-card">


    <h1>🏦 LAMA Bank</h1>

    <h2>Create Account</h2>


    <form onSubmit={handleRegister}>


    <div className="form-group">

    <label>Full Name</label>

    <input

    type="text"

    name="full_name"

    value={form.full_name}

    onChange={handleChange}

    />

    </div>




    <div className="form-group">

    <label>Email</label>

    <input

    type="email"

    name="email"

    value={form.email}

    onChange={handleChange}

    />

    </div>




    <div className="form-group">

    <label>Phone Number</label>

    <input

    type="text"

    name="phone"

    value={form.phone}

    onChange={handleChange}

    />

    </div>




    <div className="form-group">

    <label>Username</label>

    <input

    type="text"

    name="username"

    value={form.username}

    onChange={handleChange}

    />

    </div>




    <div className="form-group">

    <label>Password</label>

    <input

    type="password"

    name="password"

    value={form.password}

    onChange={handleChange}

    />

    </div>



    <button className="primary-btn">

    Create Account

    </button>


    </form>



    {message && <p>{message}</p>}


    </div>


  </div>

);


}


export default Register;