import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [shows, setShows] = useState([]);
  const [isShowsLoading, setIsShowsLoading] = useState(true);
  const [favoriteMovies, setFavoriteMovies] = useState([]);

  const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

  const { user, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchIsAdmin = async () => {
    if (!isAuthLoaded) {
      return;
    }

    if (!isSignedIn) {
      setIsAdmin(false);
      if (location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("Sign in with your admin account to continue.");
      }
      return;
    }

    setIsAdminLoading(true);
    try {
      const { data } = await axios.get("/api/admin/is-admin", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      setIsAdmin(data.isAdmin);

      if (!data.isAdmin && location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error("You are not authorized to access admin dashboard");
      }
    } catch (error) {
      console.error(error);
      setIsAdmin(false);
      if (location.pathname.startsWith("/admin")) {
        navigate("/");
        toast.error(
          error.response?.data?.message ||
            "Unable to verify admin access. Please sign in and try again.",
        );
      }
    } finally {
      setIsAdminLoading(false);
    }
  };

  const fetchShows = async () => {
    try {
      const { data } = await axios.get("/api/show/all");

      if (data.success) {
        setShows(data.shows);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsShowsLoading(false);
    }
  };

  const fetchFavoriteMovies = async () => {
    try {
      const { data } = await axios.get("/api/user/favorites", {
        headers: { Authorization: `Bearer ${await getToken()}` },
      });

      if (data.success) {
        setFavoriteMovies(data.movies);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchShows();
  }, []);

  useEffect(() => {
    if (isUserLoaded && user) {
      fetchFavoriteMovies();
    } else if (isUserLoaded && location.pathname.startsWith("/admin")) {
      navigate("/");
      toast.error("Sign in with your admin account to continue.");
    }
  }, [isUserLoaded, user]);

  const value = {
    axios,
    fetchIsAdmin,
    user,
    isUserLoaded,
    isAuthLoaded,
    isSignedIn,
    getToken,
    navigate,
    isAdmin,
    isAdminLoading,
    shows,
    isShowsLoading,
    fetchShows,
    favoriteMovies,
    fetchFavoriteMovies,
    image_base_url,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);