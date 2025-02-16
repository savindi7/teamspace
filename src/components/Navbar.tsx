import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Divider from '@mui/material/Divider';
import Logout from '@mui/icons-material/ExitToApp';
import { signOut } from "next-auth/react";
import { Session } from "@auth/core/types";

interface NavbarProps {
  session: Session | null;
  handleMenu: (event: React.MouseEvent<HTMLElement>) => void;
  anchorEl: HTMLElement | null;
  handleClose: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ session, handleMenu, anchorEl, handleClose }) => {

      const handleSignOut = async () => {
        try {
          const res = await fetch("/api/auth/sign-out", {
            method: "POST",
          });
          const data = await res.json();
    
          if (data.logoutUrl) {
            await signOut({ redirect: false });
            window.location.href = data.logoutUrl;
          } else {
            console.error("Logout URL not found.");
          }
        } catch (error) {
          console.error("Error during sign out:", error);
        }
      };

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton edge="start" color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" style={{ flexGrow: 1 }}>
                    Asgardeo x Next.js B2B Sample App
                </Typography>
                {session && (
                    <div>
                        <IconButton
                            edge="end"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <Avatar
                                alt={session.user.email || "User Avatar"}
                                src="/static/images/avatar/1.jpg"
                            />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>
                                <ListItemIcon>
                                    <AccountCircle fontSize="small" />
                                </ListItemIcon>
                                Profile
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={() => handleSignOut()}>
                                <ListItemIcon>
                                    <Logout fontSize="small" />
                                </ListItemIcon>
                                Sign Out
                            </MenuItem>
                        </Menu>
                    </div>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;