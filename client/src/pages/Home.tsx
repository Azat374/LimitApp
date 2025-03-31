import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import Chat from "@/components/Chat/Chat";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
    if (!username || !token || username.trim() === "" || token.trim() === "") {
      toast.error("Please login to continue");
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <div>
      <Chat />
    </div>
  );
};

export default Home;
