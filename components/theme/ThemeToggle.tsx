'use client';

import React, { memo } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { motion } from 'framer-motion';
import { useThemeMode } from '../providers/ThemeProvider';

const ThemeToggle = memo(() => {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          ml: 1,
          bgcolor: 'background.paper',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <motion.div
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: mode === 'dark' ? 0 : 180, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </motion.div>
      </IconButton>
    </Tooltip>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
