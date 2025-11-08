'use client';

import React, { memo, useCallback, useState } from 'react';
import { Card, CardContent, TextField, Button, Box, Typography, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import LinkIcon from '@mui/icons-material/Link';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface URLShortenerFormProps {
  onSubmit: (url: string) => Promise<{ shortUrl?: string; error?: string }>;
}

const URLShortenerForm = memo(({ onSubmit }: URLShortenerFormProps) => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);

    try {
      const result = await onSubmit(url);
      if (result.error) {
        setError(result.error);
      } else if (result.shortUrl) {
        setShortUrl(result.shortUrl);
        setUrl('');
      }
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [url, onSubmit]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shortUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <LinkIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Shorten URL
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
              <TextField
                fullWidth
                placeholder="Enter your long URL here..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                required
                type="url"
                sx={{ flex: 1 }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !url}
                sx={{
                  minWidth: 120,
                  height: 56,
                  fontWeight: 600,
                }}
              >
                {loading ? 'Shortening...' : 'Shorten'}
              </Button>
            </Box>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {shortUrl && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Alert
                severity="success"
                icon={<CheckCircleIcon />}
                sx={{ mt: 2 }}
                action={
                  <Button
                    color="inherit"
                    size="small"
                    onClick={handleCopy}
                    startIcon={copied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                }
              >
                <Typography variant="body2" fontWeight={500}>
                  {shortUrl}
                </Typography>
              </Alert>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

URLShortenerForm.displayName = 'URLShortenerForm';

export default URLShortenerForm;
