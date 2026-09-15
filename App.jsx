import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Workspaces from "./pages/Workspaces";
import Customers from "./pages/Customers";
import Employees from "./pages/Employees";
import Contractors from "./pages/Contractors";
import Equipment from "./pages/Equipment";
import Subcontractors from "./pages/Subcontractors";
import Settings from "./pages/Settings";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Users from "./pages/Users";
import { CircularProgress, Box } from "@mui/material";

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return <Layout>{children}</Layout>;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Workspaces />
                        </ProtectedRoute>
                    } />
                    <Route path="/workspaces/:workspaceId/projects" element={
                        <ProtectedRoute>
                            <Projects />
                        </ProtectedRoute>
                    } />
                    <Route path="/projects/:id" element={
                        <ProtectedRoute>
                            <ProjectDetail />
                        </ProtectedRoute>
                    } />
                    <Route path="/customers" element={
                        <ProtectedRoute>
                            <Customers />
                        </ProtectedRoute>
                    } />
                    <Route path="/employees" element={
                        <ProtectedRoute>
                            <Employees />
                        </ProtectedRoute>
                    } />
                    <Route path="/contractors" element={
                        <ProtectedRoute>
                            <Contractors />
                        </ProtectedRoute>
                    } />
                    <Route path="/equipment" element={
                        <ProtectedRoute>
                            <Equipment />
                        </ProtectedRoute>
                    } />
                    <Route path="/subcontractors" element={
                        <ProtectedRoute>
                            <Subcontractors />
                        </ProtectedRoute>
                    } />
                    <Route path="/users" element={
                        <ProtectedRoute>
                            <Users />
                        </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    } />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;