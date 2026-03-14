// Single public entry for the Design System (Blueprint rule).

export * from "./primitives/Button";
export * from "./primitives/Container";
export * from "./primitives/Divider";
export * from "./primitives/Grid";
export * from "./primitives/Stack";
export * from "./primitives/Input";
export * from "./primitives/Textarea";
export * from "./primitives/Select";
export * from "./primitives/Checkbox";
export * from "./primitives/Radio";
export * from "./primitives/Avatar";
export * from "./primitives/Spinner";
export * from "./primitives/RangeSlider";
export * from "./primitives/Switch";
export * from "./primitives/Spacer";
export * from "./primitives/Text";
export * from "./primitives/Heading";
export * from "./primitives/Caption";
export * from "./primitives/Label";
export * from "./primitives/LinkText";
export * from "./primitives/TruncatedText";
export * from "./primitives/Inline";
export * from "./primitives/Pressable";
export * from "./primitives/Hoverable";

export * from "./components/shared/Section";
export * from "./components/shared/Card";
export * from "./components/shared/ImageCard";
export * from "./components/shared/IconCard";
export * from "./components/shared/Field";
export * from "./components/shared/SearchInput";
export * from "./components/shared/OtpInput";
export * from "./components/shared/ToggleButton";
export * from "./components/shared/SplitButton";
export * from "./components/shared/LongPressButton";
export * from "./components/shared/Badge";
export * from "./components/shared/Alert";
export * from "./components/shared/Icon";
export * from "./components/shared/Modal";
export * from "./components/shared/Drawer";
export * from "./components/shared/Tabs";
export * from "./components/shared/DropdownMenu";
export * from "./components/shared/Tooltip";
export * from "./components/shared/Toast";
export * from "./components/shared/NavButtons";
export * from "./components/shared/BottomNav";
export * from "./components/shared/Accordion";
export * from "./components/shared/CollapsibleSection";
export * from "./components/shared/Breadcrumbs";
export * from "./components/shared/Pagination";
export * from "./components/shared/Banner";
export * from "./components/shared/Popover";
export * from "./components/shared/ConfirmDialog";
export * from "./components/shared/BottomSheet";
export * from "./components/shared/FullScreenModal";
export * from "./components/shared/ActionSheet";
export * from "./components/shared/ImageViewer";
export * from "./components/shared/EmptyState";
export * from "./components/shared/MetricCard";
export * from "./components/shared/Timeline";
export * from "./components/shared/Skeleton";
export * from "./components/shared/ScrollToTopButton";
export * from "./components/shared/ErrorBoundary";
export * from "./components/shared/CookieConsentBanner";
export * from "./components/shared/AppBar";
export * from "./components/shared/BulkActionsToolbar";
export * from "./components/shared/FilterPanel";
export * from "./components/shared/DataTable";
export * from "./components/shared/DataGrid";
export * from "./components/shared/Charts";
export * from "./components/shared/FormHelpers";
export * from "./components/shared/Status";
export * from "./components/shared/MarkdownEditor";
export * from "./components/shared/MarkdownRenderer";
export * from "./components/shared/RichText";
export * from "./components/shared/ExpandableText";
export * from "./components/shared/HighlightedText";
export * from "./components/shared/VideoPlayer";
export * from "./components/shared/PublicBlocks";
export * from "./components/shared/Patterns";
export { ContextMenu, type ContextMenuItem, type ContextMenuProps } from "./components/shared/ContextMenu";
export { ResourceTable, type ResourceRow, type ResourceTableProps } from "./components/shared/ResourceTable";
export * from "./components/shared/List";
export * from "./components/shared/SectionedList";
export * from "./components/shared/ExpandableListItem";
export * from "./components/shared/SwipeableListItem";
export * from "./components/shared/SwipeActionButton";
export * from "./components/shared/InfiniteList";
export * from "./components/shared/VirtualizedList";
export * from "./components/shared/ReorderableList";
export * from "./components/shared/Progress";
export * from "./components/shared/ProgressRing";
export * from "./components/shared/InlineMessage";
export * from "./components/shared/Snackbar";
export * from "./components/shared/OfflineIndicator";
export * from "./components/shared/States";
export * from "./components/shared/Autocomplete";
export * from "./components/shared/MultiSelect";
export * from "./components/shared/FileDropzone";
export * from "./components/shared/DateTimePickers";
export * from "./components/shared/TagInput";
export * from "./components/shared/AvatarGroup";
export * from "./components/shared/ResponsiveImage";
export * from "./components/shared/Carousel";
export * from "./components/shared/Sparkline";
export * from "./components/shared/Marketing";
export * from "./components/shared/SectionHeader";
export * from "./components/shared/SplitSection";
export * from "./components/shared/ThemeSwitcher";
export * from "./components/shared/PasswordInput";
export * from "./components/shared/PasswordStrengthMeter";
export * from "./components/shared/SegmentedControl";
export * from "./components/shared/FilterChips";
export * from "./components/shared/RatingInput";
export * from "./components/shared/AudioPlayer";
export * from "./components/shared/Thumbnail";
export * from "./components/shared/MediaGrid";
export * from "./components/shared/MediaPreview";
export * from "./components/shared/FilePreview";
export * from "./components/shared/KeyValueTable";
export * from "./components/shared/MasonryLayout";
export * from "./components/shared/AiPromptInput";
export * from "./components/shared/AiResultCard";
export * from "./components/shared/AiStreamingResponse";
export * from "./components/shared/AiActionSuggestions";
export * from "./components/shared/SmartAutofill";
export * from "./components/shared/AssistantSheet";
export * from "./components/shared/PermissionPrompt";
export * from "./components/shared/LocationPicker";
export * from "./components/shared/QrScannerStub";
export * from "./components/shared/HapticFeedbackTrigger";
export * from "./components/shared/AppUpdateBanner";
export * from "./components/shared/PushNotificationPreview";
export * from "./components/shared/Gates";
export * from "./components/shared/EdgeStates";

// Mobile variants (when UX diverges)
export * from "./components/mobile/MobilePanel";
export * from "./components/mobile/MobileQuickStatTile";

export * from "./layouts/PublicShell";
export * from "./layouts/CenteredShell";
export * from "./layouts/DashboardShell";
export * from "./layouts/DocsShell";

export * from "./themes/ThemeInitScript";
export * from "./foundation/themes/ThemeProvider";
export * from "./runtime/web/AppChrome";
export * from "./runtime/web/NextAuthProvider";
export * from "./runtime/web/HeaderMenu";
export * from "./runtime/web/TopBar";
export * from "./runtime/web/Footer";

// Updated blueprint layers (scaffolded, non-breaking)
export * from "./foundation";
export * from "./runtime";

export * from "./structures";
export * from "./interactions";
export * from "./patterns";
export * from "./visuals";
export * from "./widgets";
export * from "./composition";

export * from "./preview/PreviewPlatform";

export {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	ArrowUpCircle,
	Award,
	Battery,
	BookOpen,
	Bell,
	Briefcase,
	Calculator,
	Calendar,
	Car,
	Cloud,
	Check,
	CheckCheck,
	CheckCircle,
	CheckCircle2,
	ClipboardCheck,
	CreditCard,
	Download,
	Edit,
	FileCheck,
	AlertTriangle,
	ChevronDown,
	ChevronLeft,
	ChevronUp,
	Clock,
	DollarSign,
	ExternalLink,
	Eye,
	EyeOff,
	Flag,
	FileText,
	Gauge,
	Gift,
	Globe,
	HelpCircle,
	Home,
	Info,
	Layers,
	Loader,
	Loader2,
	Lock,
	Mail,
	MapPin,
	Menu,
	Minus,
	Package,
	Phone,
	Plug,
	Plus,
	Gavel,
	Monitor,
	Newspaper,
	PanelLeftClose,
	PanelLeftOpen,
	PanelRightClose,
	PanelRightOpen,
	Save,
	Search,
	Send,
	SlidersHorizontal,
	ShieldAlert,
	Smartphone,
	Settings,
	Star,
	Sun,
	Tablet,
	Trash2,
	TrendingUp,
	Trophy,
	Upload,
	User,
	WifiOff,
	Wrench,
	X,
	XCircle,
	MessageSquare,
	Building,
	Zap,
	GridIcon,
} from "./icons";
