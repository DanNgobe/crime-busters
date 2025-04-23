import { SignIn } from "@clerk/clerk-react";
import "./auth.css";

const SignInPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <SignIn signUpUrl="/sign-up" />
    </div>
  );
};

export default SignInPage;
