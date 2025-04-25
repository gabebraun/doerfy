import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/Sidebar";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import {
  BannerManager,
  type BannerConfig,
} from "../../components/BannerManager";
import { cn } from "../../lib/utils";
import { Theme, getInitialTheme } from "../../utils/theme";
import { AgingStatus, Task, TimeStage } from "../../types/task";
import {
  loadTasks,
  loadBannerConfig,
  saveBannerConfig,
} from "../../utils/storage";
import { getWeather } from "../../utils/weather";
import { Line } from "react-chartjs-2";
import {
  faTimebox1,
  faTimebox30,
  faTimebox7,
} from "@awesome.me/kit-9001a4104b/icons/kit/custom";
import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import {
  Search,
  Music2,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Filter,
  ListIcon,
  Settings,
} from "lucide-react";
import { format } from "date-fns";
import { faCalendar } from "@fortawesome/pro-light-svg-icons";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

export const Home: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [temperature, setTemperature] = useState("--°");
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const [isBannerManagerOpen, setIsBannerManagerOpen] = useState(false);
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const imageIntervalRef = useRef<number>();
  const quoteIntervalRef = useRef<number>();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Loading initial data...");
        const [loadedTasks, loadedBannerConfig] = await Promise.all([
          loadTasks(),
          loadBannerConfig(),
        ]);
        console.log("Loaded banner config:", loadedBannerConfig);
        setTasks(loadedTasks);
        setBannerConfig(loadedBannerConfig);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const weatherData = await getWeather();
      setTemperature(weatherData.temperature);
    };

    fetchWeather();
    const weatherInterval = setInterval(fetchWeather, 300000); // Update every 5 minutes

    return () => clearInterval(weatherInterval);
  }, []);

  // Image transition effect
  useEffect(() => {
    if (bannerConfig?.images?.length && bannerConfig.images.length > 1) {
      const transitionTime = (bannerConfig.transitionTime || 5) * 1000;

      imageIntervalRef.current = window.setInterval(() => {
        setCurrentImageIndex(
          (current) => (current + 1) % bannerConfig.images.length,
        );
      }, transitionTime);

      return () => {
        if (imageIntervalRef.current) {
          clearInterval(imageIntervalRef.current);
        }
      };
    }
  }, [bannerConfig?.images, bannerConfig?.transitionTime]);

  // Quote rotation effect
  useEffect(() => {
    if (
      bannerConfig?.quotes?.length &&
      bannerConfig.quotes.length > 1 &&
      bannerConfig.quoteRotation
    ) {
      const rotationTime = (bannerConfig.quoteDuration || 10) * 1000;

      quoteIntervalRef.current = window.setInterval(() => {
        setCurrentQuoteIndex(
          (current) => (current + 1) % bannerConfig.quotes.length,
        );
      }, rotationTime);

      return () => {
        if (quoteIntervalRef.current) {
          clearInterval(quoteIntervalRef.current);
        }
      };
    }
  }, [
    bannerConfig?.quotes,
    bannerConfig?.quoteRotation,
    bannerConfig?.quoteDuration,
  ]);

  // Audio initialization and management
  useEffect(() => {
    // Reset audio error when config changes
    setAudioError(null);

    // Cleanup previous audio instance
    const cleanup = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("ended", handleAudioEnded);
        audioRef.current.removeEventListener("error", handleAudioError);
        audioRef.current = null;
      }
    };

    cleanup();

    // Only initialize audio if we have valid audio sources
    if (
      bannerConfig?.audio?.length &&
      currentAudioIndex < bannerConfig.audio.length &&
      bannerConfig.audio[currentAudioIndex]?.url
    ) {
      const audio = new Audio();
      audioRef.current = audio;

      // Add error handling
      audio.addEventListener("error", handleAudioError);
      audio.addEventListener("ended", handleAudioEnded);

      // Set up audio source and configuration
      audio.src = bannerConfig.audio[currentAudioIndex].url;
      audio.volume = (bannerConfig.volume ?? 50) / 100;

      // Reset playing state
      setIsPlaying(false);

      return cleanup;
    } else {
      // Reset state if no valid audio
      setIsPlaying(false);
      setCurrentAudioIndex(0);
    }
  }, [bannerConfig?.audio, currentAudioIndex, bannerConfig?.volume]);

  const handleAudioError = (e: Event) => {
    const audio = e.currentTarget as HTMLAudioElement;
    let errorMessage = "Error loading audio";

    if (audio.error) {
      switch (audio.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMessage = "Audio playback was aborted";
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMessage = "Network error while loading audio";
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMessage = "Audio format not supported";
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = "Audio source not supported";
          break;
      }
    }

    setAudioError(errorMessage);
    setIsPlaying(false);
    console.error("Audio error:", errorMessage);
  };

  const handleAudioEnded = () => {
    if (bannerConfig?.audio?.length) {
      const nextIndex = (currentAudioIndex + 1) % bannerConfig.audio.length;
      setCurrentAudioIndex(nextIndex);

      // Only auto-play next track if we were playing
      if (isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current || !bannerConfig?.audio?.length) {
      setAudioError("No audio available");
      return;
    }

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        setAudioError(null); // Reset error state before attempting to play
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setAudioError("Failed to play audio");
      setIsPlaying(false);
    }
  };

  const handleBannerConfigSave = async (newConfig: BannerConfig) => {
    try {
      console.log("Saving new banner config:", newConfig);
      await saveBannerConfig(newConfig);
      setBannerConfig(newConfig);
      setIsBannerManagerOpen(false);
    } catch (error) {
      console.error("Error saving banner config:", error);
    }
  };

  const chartData: ChartData<"line"> = {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    datasets: [
      {
        label: "Personal",
        data: [4, 3, 5, 3, 4, 3, 4],
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.5)",
        tension: 0.4,
      },
      {
        label: "Work",
        data: [2, 4, 3, 5, 2, 3, 2],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const todayTasks = tasks.filter((task) => task.timeStage === "today");
  const agingTasks = tasks.filter(
    (task) => task.agingStatus === "warning" || task.agingStatus === "overdue",
  );
  const upcomingTasks = tasks.filter(
    (task) => task.schedule?.enabled && task.schedule.date,
  );

  console.log(agingTasks);

  const currentImage =
    bannerConfig?.images?.[currentImageIndex]?.url ||
    "https://images.pexels.com/photos/3876425/pexels-photo-3876425.jpeg";
  const currentQuote =
    bannerConfig?.quotes?.[currentQuoteIndex]?.text ||
    "Create balance through a life of purpose and joy";

  return (
    <div
      className={cn(
        "flex h-screen",
        theme === "dark" ? "dark bg-[#0F172A]" : "bg-white",
      )}
    >
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />
      <div className="flex-1 overflow-auto">
        {/* Top Header */}
        <div
          className={cn(
            "h-16 border-b flex items-center px-6 sticky top-0 z-10",
            theme === "dark"
              ? "border-[#334155] bg-[#0F172A]"
              : "border-gray-200 bg-white",
          )}
        >
          <div className="flex-1 flex items-center space-x-4">
            <Input
              placeholder="Quick Add Task"
              className={cn(
                "max-w-md",
                theme === "dark"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-gray-50",
              )}
            />
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Banner Section */}
        <div
          className="relative h-[300px] bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url("${currentImage}")` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40">
            <div className="h-full flex flex-col justify-center px-8">
              <div className="flex items-center justify-between mb-4">
                <div className="text-white">
                  <div className="text-lg">
                    {format(new Date(), "EEE, MMM d")}
                  </div>
                  <div className="text-4xl font-bold">{temperature}</div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={togglePlay}
                    disabled={!bannerConfig?.audio?.length}
                    title={audioError || undefined}
                  >
                    <Music2
                      className={cn(
                        "h-6 w-6 transition-opacity",
                        isPlaying ? "opacity-100" : "opacity-50",
                        audioError ? "text-red-400" : "text-white",
                      )}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsBannerManagerOpen(true)}
                  >
                    <Settings className="h-6 w-6" />
                  </Button>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Good Morning, Gabriel
              </h1>
              <p className="text-xl text-white/90 italic transition-opacity duration-500">
                {currentQuote}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-12 gap-6">
          {/* Task Completed Chart */}
          <div
            className={cn(
              "col-span-12 lg:col-span-6 rounded-lg border p-4",
              theme === "dark"
                ? "border-slate-700 bg-slate-800"
                : "border-gray-200",
            )}
          >
            <h2
              className={cn(
                "text-lg font-semibold mb-4",
                theme === "dark" ? "text-white" : "text-gray-900",
              )}
            >
              Tasks Completed
              <Badge className="ml-2">Last 7 Days</Badge>
            </h2>
            <div className="h-[200px]">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Do Today Section */}
          <div
            className={cn(
              "col-span-12 lg:col-span-6 rounded-lg border p-4",
              theme === "dark"
                ? "border-slate-700 bg-slate-800"
                : "border-gray-200",
            )}
          >
            <div className="flex items-center mb-4">
              <Calendar
                className={cn(
                  "w-5 h-5 mr-2",
                  theme === "dark" ? "text-slate-400" : "text-gray-500",
                )}
              />
              <h2
                className={cn(
                  "text-lg font-semibold",
                  theme === "dark" ? "text-white" : "text-gray-900",
                )}
              >
                Do Today
              </h2>
            </div>
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center p-2 rounded",
                    "hover:bg-gray-50 dark:hover:bg-slate-700",
                  )}
                >
                  <AlertTriangle
                    className={cn(
                      "w-4 h-4 mr-2",
                      task.priority === "high"
                        ? "text-red-500"
                        : task.priority === "medium"
                        ? "text-yellow-500"
                        : "text-green-500",
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1",
                      theme === "dark" ? "text-slate-200" : "text-gray-700",
                    )}
                  >
                    {task.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Aging Tasks Section */}
          <div
            className={cn(
              "col-span-12 lg:col-span-6 rounded-lg border p-4",
              theme === "dark"
                ? "border-slate-700 bg-slate-800"
                : "border-gray-200",
            )}
          >
            <div className="flex items-center mb-4">
              <Filter
                className={cn(
                  "w-5 h-5 mr-2",
                  theme === "dark" ? "text-slate-400" : "text-gray-500",
                )}
              />
              <h2
                className={cn(
                  "text-lg font-semibold",
                  theme === "dark" ? "text-white" : "text-gray-900",
                )}
              >
                Aging Tasks
              </h2>
            </div>
            <div className="space-y-2">
              {agingTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center p-2 rounded",
                    "hover:bg-gray-50 dark:hover:bg-slate-700",
                  )}
                >
                  <FontAwesomeIcon
                    icon={getIcon(task.timeStage)}
                    size="lg"
                    className={cn(
                      "translate-y-[-1px] mr-1",
                      theme === "dark" ? "text-slate-400" : "text-gray-500",
                    )}
                  />
                  <span
                    className={cn(
                      "flex-1",
                      theme === "dark" ? "text-slate-200" : "text-gray-700",
                    )}
                  >
                    {task.title}
                  </span>
                  <i
                    className={`flex items-center justify-center h-6 w-6 text-xs rounded-full ${getColor(
                      task.agingStatus,
                    )}`}
                  >
                    {task.status}
                  </i>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Section */}
          <div
            className={cn(
              "col-span-12 lg:col-span-6 rounded-lg border p-4",
              theme === "dark"
                ? "border-slate-700 bg-slate-800"
                : "border-gray-200",
            )}
          >
            <div className="flex items-center mb-4">
              <Calendar
                className={cn(
                  "w-5 h-5 mr-2",
                  theme === "dark" ? "text-slate-400" : "text-gray-500",
                )}
              />
              <h2
                className={cn(
                  "text-lg font-semibold",
                  theme === "dark" ? "text-white" : "text-gray-900",
                )}
              >
                Upcoming
              </h2>
            </div>
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center p-2 rounded",
                    "hover:bg-gray-50 dark:hover:bg-slate-700",
                  )}
                >
                  <div className="flex-1">
                    <div
                      className={cn(
                        theme === "dark" ? "text-slate-200" : "text-gray-700",
                      )}
                    >
                      {task.title}
                    </div>
                    <div className="flex items-center mt-1 text-sm">
                      <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                      <span className="text-gray-500 mr-3">
                        {format(new Date(task.schedule!.date!), "MMM d")}
                      </span>
                      {task.schedule?.time && (
                        <>
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500 mr-3">
                            {task.schedule.time}
                          </span>
                        </>
                      )}
                      {task.location && (
                        <>
                          <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                          <span className="text-gray-500">{task.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BannerManager
        isOpen={isBannerManagerOpen}
        onClose={() => setIsBannerManagerOpen(false)}
        onSave={handleBannerConfigSave}
        initialConfig={bannerConfig || undefined}
        theme={theme}
      />
    </div>
  );
};

function getIcon(stage: TimeStage) {
  switch (stage) {
    case "queue":
      return faCalendar;
    case "do":
      return faTimebox30;
    case "doing":
      return faTimebox7;
    case "today":
      return faTimebox1;
    case "done":
      return faTimebox1;
    default:
      return faTimebox1;
  }
}

function getColor(status: AgingStatus) {
  switch (status) {
    case "normal":
      return "bg-gray-500 text-white";
    case "warning":
      return "bg-yellow-500 text-secondary-foreground";
    case "overdue":
      return "bg-red-500 text-destructive-foreground";
    default:
      return "bg-gray-500 text-white";
  }
}
