'use client';

import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
  delay?: number;
}

const StatsCard = memo(({ title, value, icon, trend, color = '#3b82f6', delay = 0 }: StatsCardProps) => {
  const isPositiveTrend = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          overflow: 'visible',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${color}, ${color}99)`,
            borderRadius: '12px 12px 0 0',
          },
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                sx={{ fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {title}
              </Typography>
              <Typography variant="h4" component="div" sx={{ fontWeight: 700, my: 1 }}>
                {value}
              </Typography>
              {trend !== undefined && (
                <Box display="flex" alignItems="center" gap={0.5}>
                  {isPositiveTrend ? (
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 16, color: 'error.main' }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      color: isPositiveTrend ? 'success.main' : 'error.main',
                      fontWeight: 600,
                    }}
                  >
                    {isPositiveTrend ? '+' : ''}{trend}% from last month
                  </Typography>
                </Box>
              )}
            </Box>
            <Avatar
              sx={{
                bgcolor: `${color}20`,
                color: color,
                width: 56,
                height: 56,
              }}
            >
              {icon}
            </Avatar>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
