import ForgotPasswordAuth from "@/module/auth/components/ForgotPasswordAuth";

const ForgotPasswordPage = () => {
  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="relative z-10">
          <ForgotPasswordAuth />
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordPage;
