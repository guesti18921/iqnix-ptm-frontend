import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            api.get("/me")
                .then((res) => {
                    setUser(res.data.user);
                    setRoles(res.data.roles);
                })
                .catch(() => {
                    localStorage.removeItem("token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const res = await api.post("/login", { email, password });
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        setRoles(res.data.roles);
        return res.data;
    };

    const logout = async () => {
        await api.post("/logout");
        localStorage.removeItem("token");
        setUser(null);
        setRoles([]);
    };

    const hasRole = (role) => roles.includes(role);

    return (
        <AuthContext.Provider value={{ user, roles, loading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);