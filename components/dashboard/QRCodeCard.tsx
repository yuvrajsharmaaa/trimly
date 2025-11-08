'use client';

import React, { memo } from 'react';
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import DownloadIcon from '@mui/icons-material/Download';

interface QRCodeCardProps {
  url: string;
  title?: string;
}

const QRCodeCard = memo(({ url, title = 'QR Code' }: QRCodeCardProps) => {
  const handleDownload = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = 'qr-code.png';
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
          </Typography>
          
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            p={3}
            bgcolor="background.default"
            borderRadius={2}
            my={2}
          >
            <QRCode
              id="qr-code-svg"
              value={url}
              size={200}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              viewBox="0 0 200 200"
            />
          </Box>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download QR Code
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
});

QRCodeCard.displayName = 'QRCodeCard';

export default QRCodeCard;
