import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import "../styles/Form.css"
import LoadingIndicator from "./LoadingIndicator";

function Form({route, method}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try{
            const res = await api.post(route,{
                username,
                email,
                password
            })
            if(method === "login"){
                const access = res?.data?.access;
                const refresh = res?.data?.refresh;
                if (!access || !refresh) {
                    throw new Error("Authentication response is missing access or refresh tokens.");
                }
                localStorage.setItem(ACCESS_TOKEN, access)
                localStorage.setItem(REFRESH_TOKEN, refresh)

                navigate("/")
                }

            else{
                navigate("/login")
            }
            
        }
        catch(error){
            alert(error)
        }
        finally{
            setLoading(false);
        }
    }
    return <form onSubmit={handleSubmit} className="form-container">
        <h1>{name}</h1>
        <input
            className="form-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
        />
        <input
            className="form-input"
            type="text"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />
         <input
            className="form-input"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        {loading && <LoadingIndicator/>}
        <button className="form-button" type="submit">
            {name}
        </button>
    </form>
        
}

export default Form;
