import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    InputAdornment,
    IconButton,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate("/");
        } catch (err) {
            setError("Неверный email или пароль");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.default",
                p: 2,
            }}
        >
            <Paper
                sx={{
                    p: 4,
                    width: 400,
                    maxWidth: "100%",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 3,
                }}
            >
                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ letterSpacing: "0.02em", mb: 0.5 }}
                    >
                        IQNIX <Box component="span" sx={{ color: "primary.main" }}>PTM</Box>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Система расчёта стоимости IT-проекта
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* autoComplete отключает сохранение/автозаполнение браузером */}
                <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                    <TextField
                        label="Email"
                        type="email"
                        name="email-no-autofill"
                        autoComplete="off"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        label="Пароль"
                        type={showPassword ? "text" : "password"}
                        name="password-no-autofill"
                        autoComplete="new-password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        edge="end"
                                        size="small"
                                        tabIndex={-1}
                                    >
                                        {showPassword
                                            ? <VisibilityOff sx={{ fontSize: 20 }} />
                                            : <Visibility sx={{ fontSize: 20 }} />
                                        }
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        sx={{ py: 1.25 }}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Войти"}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
