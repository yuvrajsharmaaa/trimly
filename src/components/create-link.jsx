import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Error from "./error";
import * as yup from "yup";
import { BeatLoader } from "react-spinners";
import { UrlState } from "@/context";
import supabase from "@/db/superbase";
import QRCode from "qrcode";

export function CreateLink() {
  const { user } = UrlState();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    longUrl: "",
    customUrl: "",
  });

  const schema = yup.object().shape({
    longUrl: yup
      .string()
      .trim()
      .url("Must be a valid URL")
      .required("Long URL is required"),
    customUrl: yup
      .string()
      .trim()
      .matches(/^[a-zA-Z0-9-_]*$/, "Only letters, numbers, hyphens and underscores are allowed")
      .min(3, "Custom URL must be at least 3 characters")
      .max(20, "Custom URL must be less than 20 characters")
      .nullable()
      .transform((value) => (value === "" ? null : value)),
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: value || "",
    }));
    // Clear error when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: null,
      }));
    }
  };

  const generateQRCode = async (url) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  };

  const createNewLink = async () => {
    setErrors({});
    setLoading(true);
    try {
      // Validate form data
      const validatedData = await schema.validate(formValues, { abortEarly: false });

      // Create the short URL
      const shortUrl = validatedData.customUrl || Math.random().toString(36).substring(2, 10);
      
      // Ensure the long URL has a protocol
      let originalUrl = validatedData.longUrl;
      if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
        originalUrl = 'https://' + originalUrl;
      }

      // Generate QR code
      const shortUrlFull = `${window.location.origin}/${shortUrl}`;
      const qrCode = await generateQRCode(shortUrlFull);

      // Insert into Supabase
      const { data, error } = await supabase
        .from('urls')
        .insert({
          user_id: user?.id || null,
          original_url: originalUrl,
          short_url: shortUrl,
          custom_url: validatedData.customUrl,
          qr_code: qrCode
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating link:', error);
        if (error.code === '23505') {
          setErrors({ customUrl: 'This custom URL is already taken. Please try another one.' });
        } else {
          setErrors({ message: error.message || 'Failed to create link' });
        }
        return;
      }

      setOpen(false);
      navigate(`/link/${data.id}`);
    } catch (err) {
      console.error('Validation error:', err);
      if (err.inner) {
        // Yup validation errors
        const validationErrors = {};
        err.inner.forEach((error) => {
          validationErrors[error.path] = error.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ message: err.message || 'Failed to create link' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Input
              id="longUrl"
              placeholder="Enter your Long URL"
              value={formValues.longUrl}
              onChange={handleInputChange}
              className={errors.longUrl ? "border-red-500" : ""}
            />
            {errors.longUrl && <Error message={errors.longUrl} />}
          </div>

          <div>
            <Input
              id="customUrl"
              placeholder="Custom short URL (optional)"
              value={formValues.customUrl}
              onChange={handleInputChange}
              className={errors.customUrl ? "border-red-500" : ""}
            />
            {errors.customUrl && <Error message={errors.customUrl} />}
          </div>
        </div>

        {errors.message && <Error message={errors.message} />}
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="destructive"
            onClick={createNewLink}
            disabled={loading}
          >
            {loading ? <BeatLoader size={10} color="white" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}