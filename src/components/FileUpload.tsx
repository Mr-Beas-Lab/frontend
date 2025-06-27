import { Label } from "@radix-ui/react-label";
import { useRef } from "react";
import { Button } from "./ui/button";
import { AlertCircle, Upload } from "lucide-react";


interface FileUploadProps {
  id: string;
  label: string;
  accept: string;
  onChange: (file: File | null) => void;
  previewUrl: string | null;
  error: string | null;
}


export const FileUpload = ({ id, label, accept, onChange, previewUrl, error }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        onClick={handleClick}
      >
        <input
          type="file"
          id={id}
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleChange}
        />
        
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl || "/placeholder.svg"} 
              alt="Preview" 
              className="mx-auto max-h-48 rounded-md" 
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="absolute top-2 right-2 "
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              SVG, PNG, JPG or JPEG (max. 5MB)
            </p>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
};