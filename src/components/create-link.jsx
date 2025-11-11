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
import { useState } from "react";
import Error from "./error";
import * as yup from "yup";
import { BeatLoader } from "react-spinners";
import { createUrl } from "@/db/apiUrls";
import QRCode from "qrcode";
import supabase from "@/db/superbase";

export function CreateLink() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    original_url: "",
    customUrl: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]: value,
    });
  };

  const createNewLink = async () => {
    setErrors({});
    setLoading(true);

    try {
      const schema = yup.object().shape({
        original_url: yup.string().url("Must be a valid URL").required("URL is required"),
        customUrl: yup.string(),
      });

      await schema.validate(formValues, { abortEarly: false });

      // Create the URL first to get the actual short code
      const data = await createUrl(
        {
          longUrl: formValues.original_url,
          customUrl: formValues.customUrl,
        },
        null // Pass null for qrCode initially
      );

      // Now generate QR code with the correct short URL
      const actualShortCode = data.custom_url || data.short_url;
      const qrCodeUrl = `${window.location.origin}/${actualShortCode}`;
      const qrCode = await QRCode.toDataURL(qrCodeUrl);

      // Update the URL with the QR code
      const { error: updateError } = await supabase
        .from("urls")
        .update({ qr_code: qrCode })
        .eq("id", data.id);

      if (updateError) {
        console.error("Error updating QR code:", updateError);
      }

      router.push(`/link/${data.id}`);
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      } else {
        setErrors({ message: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
        </DialogHeader>

        {errors.message && <Error message={errors.message} />}

        <Input
          id="original_url"
          placeholder="Enter your Long URL"
          value={formValues.original_url}
          onChange={handleInputChange}
        />
        {errors.original_url && <Error message={errors.original_url} />}

        <Input
          id="customUrl"
          placeholder="Custom Link (optional)"
          value={formValues.customUrl}
          onChange={handleInputChange}
        />
        {errors.customUrl && <Error message={errors.customUrl} />}

        <DialogFooter>
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