'use client';

import React, { memo, useCallback, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { motion } from 'framer-motion';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import BarChartIcon from '@mui/icons-material/BarChart';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { debounce } from '../../utils/debounce';

interface LinkItem {
  id: string;
  shortUrl: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

interface LinkListProps {
  links: LinkItem[];
  onShowQR?: (link: LinkItem) => void;
  onShowStats?: (link: LinkItem) => void;
}

const LinkList = memo(({ links, onShowQR, onShowStats }: LinkListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCopy = useCallback((link: LinkItem) => {
    navigator.clipboard.writeText(link.shortUrl);
    setCopiedId(link.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSearchChange = useCallback(
    debounce((value: string) => {
      setSearchQuery(value);
    }, 300),
    []
  );

  const filteredLinks = React.useMemo(
    () =>
      links.filter(
        (link) =>
          link.shortUrl.toLowerCase().includes(searchQuery.toLowerCase()) ||
          link.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [links, searchQuery]
  );

  const Row = memo(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const link = filteredLinks[index];
    const isCopied = copiedId === link.id;

    return (
      <motion.div
        style={style}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <Card
          sx={{
            mx: 2,
            my: 1,
            transition: 'all 0.2s',
            '&:hover': {
              transform: 'translateX(4px)',
              boxShadow: 4,
            },
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
              <Box flex={1} minWidth={0}>
                <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    sx={{
                      color: 'primary.main',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() => window.open(link.shortUrl, '_blank')}
                  >
                    {link.shortUrl}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => window.open(link.shortUrl, '_blank')}
                    sx={{ p: 0.5 }}
                  >
                    <OpenInNewIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {link.originalUrl}
                </Typography>
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                  <Chip
                    label={`${link.clicks} clicks`}
                    size="small"
                    icon={<BarChartIcon />}
                    color="primary"
                    variant="outlined"
                  />
                  <Typography variant="caption" color="text.secondary">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" gap={0.5} flexShrink={0}>
                <IconButton
                  size="small"
                  onClick={() => handleCopy(link)}
                  color={isCopied ? 'success' : 'default'}
                  sx={{
                    bgcolor: isCopied ? 'success.light' : 'action.hover',
                  }}
                >
                  {isCopied ? <CheckCircleIcon /> : <ContentCopyIcon />}
                </IconButton>
                {onShowQR && (
                  <IconButton
                    size="small"
                    onClick={() => onShowQR(link)}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <QrCode2Icon />
                  </IconButton>
                )}
                {onShowStats && (
                  <IconButton
                    size="small"
                    onClick={() => onShowStats(link)}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    <BarChartIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    );
  });

  Row.displayName = 'LinkRow';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          My Links ({filteredLinks.length})
        </Typography>
        <TextField
          fullWidth
          placeholder="Search links..."
          onChange={(e) => handleSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 1 }}
        />
      </CardContent>

      <Box flex={1} minHeight={0}>
        {filteredLinks.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height="100%"
            p={4}
          >
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No links found' : 'No links yet. Create your first short link!'}
            </Typography>
          </Box>
        ) : (
          <List
            height={isMobile ? 400 : 600}
            itemCount={filteredLinks.length}
            itemSize={140}
            width="100%"
          >
            {Row}
          </List>
        )}
      </Box>
    </Card>
  );
});

LinkList.displayName = 'LinkList';

export default LinkList;
