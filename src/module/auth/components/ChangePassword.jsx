import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ButtonConfig } from "@/config/ButtonConfig";
import { useToast } from "@/hooks/use-toast";
import { useChangePassword } from "@/module/auth/hooks/useAuth";
import Cookies from "js-cookie";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const ChangePassword = ({ open, setOpen }) => {
  const { toast } = useToast();
  const username = Cookies.get("name");
  const [formData, setFormData] = useState({
    username: username,
    old_password: "",
    new_password: "",
  });

  const changePasswordMutation = useChangePassword({
    onSuccess: () => {
      setFormData({ username: username, old_password: "", new_password: "" });
      setOpen(false);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const missingFields = [];
    if (!formData.username) missingFields.push("Username");
    if (!formData.old_password) missingFields.push("Current Password");
    if (!formData.new_password) missingFields.push("New Password");

    if (missingFields.length > 0) {
      toast({
        title: "Validation Error",
        description: (
          <div>
            <p>Please fill in the following fields:</p>
            <ul className="list-disc pl-5">
              {missingFields.map((field, index) => (
                <li key={index}>{field}</li>
              ))}
            </ul>
          </div>
        ),
        variant: "destructive",
      });
      return;
    }

    changePasswordMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="w-full max-w-xs sm:max-w-md"
        aria-describedby={null}
      >
        <DialogHeader>
          <DialogTitle>Change Password </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="old_password">Current Password</Label>
            <Input
              id="old_password"
              name="old_password"
              value={formData.old_password}
              onChange={handleInputChange}
              placeholder="Enter Current Password (max-16)"
              type="password"
              maxLength={16}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input
              id="new_password"
              name="new_password"
              value={formData.new_password}
              onChange={handleInputChange}
              placeholder="Enter New Password (max-16)"
              type="password"
              maxLength={16}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={changePasswordMutation.isPending}
            className={`${ButtonConfig.backgroundColor} ${ButtonConfig.hoverBackgroundColor} ${ButtonConfig.textColor}`}
          >
            {changePasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Change Password"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePassword;
