import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../main";
import {
    Box, Drawer, AppBar, Toolbar, Typography,
    List, ListItem, ListItemButton, ListItemIcon,
    ListItemText, IconButton, Tooltip, Divider, useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import ComputerOutlinedIcon from "@mui/icons-material/ComputerOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

const DRAWER_WIDTH = 240;

export default function Layout({ children }) {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, toggleTheme } = useThemeMode();

    const theme = useTheme();
    // true на узких экранах (телефон/планшет), false на десктопе
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [mobileOpen, setMobileOpen] = useState(false);

    const menuItems = [
        { text: "Рабочие области", icon: <FolderOutlinedIcon fontSize="small" />, path: "/" },
        { text: "Заказчики",       icon: <BusinessOutlinedIcon fontSize="small" />, path: "/customers" },
        { text: "Сотрудники",      icon: <PeopleOutlinedIcon fontSize="small" />, path: "/employees" },
        { text: "Исполнители",     icon: <EngineeringOutlinedIcon fontSize="small" />, path: "/contractors" },
        { text: "Оборудование",    icon: <ComputerOutlinedIcon fontSize="small" />, path: "/equipment" },
        { text: "Субподрядчики",   icon: <GroupsOutlinedIcon fontSize="small" />, path: "/subcontractors" },
        ...(hasRole("admin") ? [{ text: "Пользователи", icon: <ManageAccountsOutlinedIcon fontSize="small" />, path: "/users" }] : []),
        { text: "Настройки",       icon: <SettingsOutlinedIcon fontSize="small" />, path: "/settings" },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const handleNavigate = (path) => {
        navigate(path);
        if (isMobile) setMobileOpen(false); // закрываем меню после выбора на телефоне
    };

    // Содержимое меню — одинаковое для обоих режимов
    const drawerContent = (
        <List disablePadding>
            {menuItems.map((item) => {
                const isSettings = item.text === 'Настройки';
                return (
                    <Box key={item.text}>
                        {isSettings && <Divider sx={{ mx: 2, my: 1 }} />}
                        <ListItem disablePadding>
                            <ListItemButton
                                selected={location.pathname === item.path}
                                onClick={() => handleNavigate(item.path)}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    </Box>
                );
            })}
        </List>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar position="fixed" sx={{ zIndex: 1201 }}>
                <Toolbar sx={{ minHeight: '56px !important', px: { xs: 1, sm: 2 } }}>
                    {/* Кнопка-бургер только на мобильном */}
                    {isMobile && (
                        <IconButton
                            onClick={() => setMobileOpen(!mobileOpen)}
                            size="small"
                            sx={{ mr: 1 }}
                            aria-label="Меню"
                        >
                            <MenuIcon sx={{ fontSize: 22 }} />
                        </IconButton>
                    )}

                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow: 1,
                            fontWeight: 700,
                            fontSize: '1rem',
                            letterSpacing: '0.02em',
                        }}
                    >
                        IQNIX PTM
                    </Typography>

                    {/* Имя пользователя прячем на узком экране, чтобы влезло */}
                    {!isMobile && (
                        <Typography
                            variant="body2"
                            sx={{ mr: 1.5, color: 'text.secondary', fontSize: '0.8125rem' }}
                        >
                            {user?.name} {user?.last_name}
                        </Typography>
                    )}

                    <Tooltip title={mode === 'dark' ? 'Светлая тема' : 'Тёмная тема'} arrow>
                        <IconButton onClick={toggleTheme} size="small" sx={{ mr: 0.5 }}>
                            {mode === 'dark'
                                ? <LightModeOutlinedIcon sx={{ fontSize: 18 }} />
                                : <DarkModeOutlinedIcon  sx={{ fontSize: 18 }} />
                            }
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Выйти" arrow>
                        <IconButton onClick={handleLogout} size="small">
                            <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </AppBar>

            {/* ДЕСКТОП: постоянный сайдбар */}
            {!isMobile && (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: DRAWER_WIDTH,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            mt: '56px',
                            pt: 1,
                            pb: 1,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            {/* МОБИЛЬНЫЙ: выдвижной сайдбар */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: DRAWER_WIDTH,
                            boxSizing: 'border-box',
                            mt: '56px',
                            pt: 1,
                            pb: 1,
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>
            )}

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 1.5, sm: 3 },
                    mt: '56px',
                    minHeight: 'calc(100vh - 56px)',
                    backgroundColor: 'background.default',
                    display: 'flex',
                    justifyContent: 'center',
                    width: '100%',
                    overflowX: 'hidden',
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 1100 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
