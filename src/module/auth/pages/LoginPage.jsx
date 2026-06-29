import LoginAuth from "@/module/auth/components/LoginAuth";

const LoginPage = () => {
  return (
    <>
      <div className="relative w-full min-h-screen overflow-hidden">
        <div className="relative z-10">
          <LoginAuth />
        </div>
      </div>
    </>
  );
};

export default LoginPage;
