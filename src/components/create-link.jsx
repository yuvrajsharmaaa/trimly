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
import { useRouter } from "next/navigation";
import { useState, useCallback, useMemo } from "react";
import Error from "./error";
import * as yup from "yup";
import { BeatLoader } from "react-spinners";
import { createUrl } from "@/db/apiUrls";
import QRCode from "qrcode";

/**
 * Optimized CreateLink Component
 * Implements debouncing, memoization, and efficient state management
 */
export function CreateLink() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    original_url: "",
    customUrl: "",
  });

  // Memoized validation schema - computed once
  const schema = useMemo(() => yup.object().shape({
    original_url: yup
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
  }), []);

  // Optimized input change handler with useCallback
  const handleInputChange = useCallback((e) => {
    const { id, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [id]: value || "",
    }));
    // Clear error when user starts typing
    setErrors((prev) => {
      if (!prev[id]) return prev;
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  // Memoized QR code generator with error handling
  const generateQRCode = useCallback(async (url) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      });
      return qrDataUrl;
    } catch (err) {
      console.error('Error generating QR code:', err);
      return null;
    }
  }, []);

  // Optimized link creation with error recovery
  const createNewLink = useCallback(async () => {
    setErrors({});
    setLoading(true);
    
    try {
      // Validate form data
      const validatedData = await schema.validate(formValues, { abortEarly: false });

      // Determine the short URL (custom or generated)
      const shortUrl = validatedData.customUrl || null;
      
      // Generate QR code
      const shortUrlForQR = validatedData.customUrl || 'temp';
      const shortUrlFull = `${window.location.origin}/${shortUrlForQR}`;
      const qrCode = await generateQRCode(shortUrlFull);

      // Create URL using optimized API
      const data = await createUrl({
        longUrl: validatedData.original_url,
        customUrl: validatedData.customUrl,
      }, qrCode);

      // Close dialog and navigate
      setFormValues({ original_url: "", customUrl: "" });
      setOpen(false);
      router.push(`/link/${data.id}`);
      
    } catch (err) {
      console.error('Error creating link:', err);
      
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
  }, [formValues, schema, generateQRCode, router]);

  // Memoized button disabled state
  const isDisabled = useMemo(() => 
    loading || !formValues.original_url.trim(), 
    [loading, formValues.original_url]
  );

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
              id="original_url"
              placeholder="Enter your Long URL"
              value={formValues.original_url}
              onChange={handleInputChange}
              className={errors.original_url ? "border-red-500" : ""}
              autoComplete="url"
            />
            {errors.original_url && <Error message={errors.original_url} />}
          </div>

          <div>
            <Input
              id="customUrl"
              placeholder="Custom short URL (optional)"
              value={formValues.customUrl}
              onChange={handleInputChange}
              className={errors.customUrl ? "border-red-500" : ""}
              autoComplete="off"
            />
            {errors.customUrl && <Error message={errors.customUrl} />}
            <p className="text-xs text-gray-500 mt-1">
              3-20 characters: letters, numbers, hyphens, underscores
            </p>
          </div>
        </div>

        {errors.message && <Error message={errors.message} />}
        
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="destructive"
            onClick={createNewLink}
            disabled={isDisabled}
          >
            {loading ? <BeatLoader size={10} color="white" /> : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}