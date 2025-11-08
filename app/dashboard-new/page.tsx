'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
  AppBar,
  Toolbar,
  CircularProgress,
  Backdrop,
  Dialog,
} from '@mui/material';
import { motion } from 'framer-motion';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import useFetch from '../../hooks/use-fetch';
import { getUrls } from '../../db/apiUrls';
import { getClicksForUrls } from '../../db/apiClicks';

import StatsCard from '../../components/dashboard/StatsCard';
import LinkList from '../../components/dashboard/LinkList';
import URLShortenerForm from '../../components/dashboard/URLShortenerForm';
import QRCodeCard from '../../components/dashboard/QRCodeCard';
import ThemeToggle from '../../components/theme/ThemeToggle';

interface LinkItem {
  id: string;
  short_url: string;
  original_url: string;
  title?: string;
  custom_url?: string;
  created_at: string;
}

interface ClickData {
  id: string;
  url_id: string;
}

export default function DashboardPage() {
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<any>(null);

  const { loading, error, data: urls, fn: fnUrls } = useFetch(getUrls);
  const {
    loading: loadingClicks,
    data: clicks,
    fn: fnClicks,
  } = useFetch(
    getClicksForUrls,
    ((urls as any) || [])?.map((url: any) => url.id)
  );

  useEffect(() => {
    fnUrls();
  }, [fnUrls]);

  useEffect(() => {
    if ((urls as any)?.length) fnClicks();
  }, [urls, fnClicks]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!urls || !clicks) {
      return {
        totalLinks: 0,
        totalClicks: 0,
        activeLinks: 0,
        topLink: null,
      };
    }

    const urlsArray = urls as LinkItem[];
    const clicksArray = clicks as ClickData[];

    const now = new Date();
    const activeLinks = urlsArray.filter((url) => {
      const created = new Date(url.created_at);
      const diffDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;

    const urlWithClicks = urlsArray.map((url) => ({
      ...url,
      clickCount: clicksArray.filter((c) => c.url_id === url.id).length,
    }));

    const topLink = urlWithClicks.reduce(
      (max, curr) => (curr.clickCount > (max?.clickCount || 0) ? curr : max),
      null as any
    );

    return {
      totalLinks: urlsArray.length,
      totalClicks: clicksArray.length,
      activeLinks,
      topLink,
    };
  }, [urls, clicks]);

  // Transform URLs for LinkList component
  const linkItems = useMemo(() => {
    if (!urls || !clicks) return [];
    
    const urlsArray = urls as LinkItem[];
    const clicksArray = clicks as ClickData[];

    return urlsArray.map((url) => ({
      id: url.id,
      shortUrl: url.custom_url || url.short_url,
      originalUrl: url.original_url,
      clicks: clicksArray.filter((c) => c.url_id === url.id).length,
      createdAt: url.created_at,
    }));
  }, [urls, clicks]);

  const handleShowQR = useCallback((link: any) => {
    setSelectedLink(link);
    setQrDialogOpen(true);
  }, []);

  const handleCloseQR = useCallback(() => {
    setQrDialogOpen(false);
    setSelectedLink(null);
  }, []);

  const handleCreateShortUrl = useCallback(async (url: string) => {
    // This should integrate with your existing CreateLink component logic
    // For now, returning a mock response
    try {
      // TODO: Integrate with actual API
      await fnUrls();
      return { shortUrl: `https://trimly.app/${Math.random().toString(36).substr(2, 6)}` };
    } catch (err) {
      return { error: 'Failed to create short URL' };
    }
  }, [fnUrls]);

  const isLoading = loading || loadingClicks;

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            <LinkIcon sx={{ fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Trimly
            </Typography>
          </Box>
          <ThemeToggle />
        </Toolbar>
      </AppBar>

      <Backdrop open={isLoading || false} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <CircularProgress />
      </Backdrop>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Track and manage all your shortened URLs in one place
          </Typography>
        </motion.div>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Suspense fallback={<CircularProgress />}>
              <StatsCard
                title="Total Links"
                value={stats.totalLinks}
                icon={<LinkIcon />}
                color="#3b82f6"
                delay={0}
              />
            </Suspense>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Suspense fallback={<CircularProgress />}>
              <StatsCard
                title="Total Clicks"
                value={stats.totalClicks}
                icon={<BarChartIcon />}
                color="#10b981"
                trend={12}
                delay={0.1}
              />
            </Suspense>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Suspense fallback={<CircularProgress />}>
              <StatsCard
                title="Active Links"
                value={stats.activeLinks}
                icon={<TrendingUpIcon />}
                color="#f59e0b"
                delay={0.2}
              />
            </Suspense>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Suspense fallback={<CircularProgress />}>
              <StatsCard
                title="Top Link"
                value={stats.topLink?.clickCount || 0}
                icon={<StarIcon />}
                color="#8b5cf6"
                delay={0.3}
              />
            </Suspense>
          </Grid>
        </Grid>

        {/* URL Shortener Form */}
        <Box sx={{ mb: 4 }}>
          <Suspense fallback={<CircularProgress />}>
            <URLShortenerForm onSubmit={handleCreateShortUrl} />
          </Suspense>
        </Box>

        {/* Links List */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Suspense fallback={<CircularProgress />}>
              <LinkList
                links={linkItems}
                onShowQR={handleShowQR}
                onShowStats={(link) => console.log('Show stats for:', link)}
              />
            </Suspense>
          </Grid>
        </Grid>
      </Container>

      {/* QR Code Dialog */}
      <Dialog
        open={qrDialogOpen}
        onClose={handleCloseQR}
        maxWidth="sm"
        fullWidth
      >
        {selectedLink && (
          <QRCodeCard
            url={selectedLink.shortUrl}
            title={`QR Code for ${selectedLink.shortUrl}`}
          />
        )}
      </Dialog>
    </>
  );
}
