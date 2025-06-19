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
import { useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Error from "./error";
import * as yup from "yup";
import { BeatLoader } from "react-spinners";
import { UrlState } from "@/context";
import supabase from "@/db/superbase";

export function CreateLink() {
  const { user, isGuest } = UrlState();
  const navigate = useNavigate();

  let [searchParams, setSearchParams] = useSearchParams();
  const longLink = searchParams.get("createNew");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState({
    longUrl: "",
    customUrl: "",
  });

  // Handle longLink param change
  useEffect(() => {
    if (longLink) {
      setFormValues(prev => ({
        ...prev,
        longUrl: longLink
      }));
    }
  }, [longLink]);

  const schema = yup.object().shape({
    longUrl: yup
      .string()
      .url("Must be a valid URL")
      .required("Long URL is required"),
    customUrl: yup.string(),
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const createNewLink = async () => {
    setErrors({});
    setLoading(true);
    try {
      // Validate form data
      await schema.validate(formValues, { abortEarly: false });

      // Create the short URL
      const shortUrl = formValues.customUrl || Math.random().toString(36).substr(2, 6);
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('urls')
        .insert({
          user_id: isGuest ? 'guest' : user?.id,
          original_url: formValues.longUrl,
          short_url: shortUrl,
          custom_url: formValues.customUrl || null
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setErrors({ message: error.message || 'Failed to create link' });
        return;
      }

      if (data) {
        navigate(`/link/${data.id}`);
      }
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
        // Other errors
        setErrors({ message: err.message || 'Failed to create link' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      defaultOpen={!!longLink}
      onOpenChange={(res) => {
        if (!res) setSearchParams({});
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive">Create New Link</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold text-2xl">Create New</DialogTitle>
        </DialogHeader>

        <Input
          id="longUrl"
          placeholder="Enter your Long URL"
          value={formValues.longUrl || ""}
          onChange={handleChange}
        />
        {errors.longUrl && <Error message={errors.longUrl} />}
        
        <Input
          id="customUrl"
          placeholder="Custom short URL (optional)"
          value={formValues.customUrl || ""}
          onChange={handleChange}
        />
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