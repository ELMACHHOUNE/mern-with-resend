import { useState, useCallback, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import EmailList from "./EmailList";
import ThreadView from "./ThreadView";
import ComposeModal from "./ComposeModal";
import {
  listThreads,
  searchThreads,
} from "../../api/email";
import useSocket from "../../hooks/useSocket";

export default function InboxLayout() {
  const [activeFolder, setActiveFolder] = useState("inbox");
  const [threads, setThreads] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [selectedThreadId, setSelectedThreadId] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [composeData, setComposeData] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({ inbox: 0 });
  const pageRef = useRef(1);

  const loadThreads = useCallback(
    async (folder, page = 1) => {
      setLoading(true);
      setError("");
      try {
        const data = await listThreads(folder, page);
        if (page === 1) {
          setThreads(data.threads || []);
        } else {
          setThreads((prev) => [...prev, ...(data.threads || [])]);
        }
        setPagination(data.pagination);
        pageRef.current = page;
      } catch (err) {
        console.error("Failed to load threads:", err);
        setError(err.message || "Failed to load emails");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    async (q) => {
      setSearchQuery(q);
      if (!q.trim()) {
        setIsSearching(false);
        loadThreads(activeFolder, 1);
        return;
      }
      setIsSearching(true);
      setLoading(true);
      try {
        const data = await searchThreads(q, activeFolder);
        setThreads(data.threads || []);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setLoading(false);
      }
    },
    [activeFolder, loadThreads]
  );

  useEffect(() => {
    if (!isSearching) {
      loadThreads(activeFolder, 1);
    }
    setSelectedThreadId(null);
  }, [activeFolder, isSearching, loadThreads]);

  const handleNewEmail = useCallback(
    (data) => {
      if (activeFolder === "inbox" || activeFolder === data.thread?.folder) {
        setThreads((prev) => {
          const exists = prev.find((t) => t._id === data.thread?._id);
          if (exists) return prev;
          return [{ ...data.thread, latestMessage: data.message }, ...prev];
        });
      }
      setUnreadCounts((prev) => ({
        ...prev,
        inbox: (prev.inbox || 0) + 1,
      }));
    },
    [activeFolder]
  );

  useSocket(handleNewEmail);

  const handleFolderChange = useCallback((folder) => {
    if (folder === "starred") {
      setActiveFolder("inbox");
      setIsSearching(true);
      setSearchQuery("");
      setLoading(true);
      listThreads("inbox", 1)
        .then((data) => {
          const starred = (data.threads || []).filter((t) => t.isStarred);
          setThreads(starred);
        })
        .finally(() => setLoading(false));
      return;
    }
    setActiveFolder(folder);
    setIsSearching(false);
    setSearchQuery("");
  }, []);

  const handleCompose = useCallback(
    (initial = {}) => {
      setComposeData(initial);
      setShowCompose(true);
    },
    []
  );

  const handleComposeClose = useCallback(
    (sent) => {
      setShowCompose(false);
      setComposeData({});
      if (sent) {
        loadThreads(activeFolder, 1);
      }
    },
    [activeFolder, loadThreads]
  );

  const handleLoadMore = useCallback(() => {
    if (pagination && pageRef.current < pagination.totalPages) {
      loadThreads(activeFolder, pageRef.current + 1);
    }
  }, [activeFolder, pagination, loadThreads]);

  return (
    <div className="flex h-full flex-1 overflow-hidden">
      <Sidebar
        activeFolder={activeFolder}
        onFolderChange={handleFolderChange}
        unreadCounts={unreadCounts}
        onCompose={() => handleCompose()}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center gap-3 border-b border-[var(--color-hairline)] px-4 py-3">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="flex flex-1 overflow-hidden">
          {selectedThreadId ? (
            <ThreadView
              threadId={selectedThreadId}
              onBack={() => setSelectedThreadId(null)}
              activeFolder={activeFolder}
            />
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden">
              {error && (
                <div className="mx-4 mt-3 rounded-[8px] border border-[var(--color-accent-red)]/20 bg-[var(--color-accent-red)]/10 px-3 py-2 text-xs text-[var(--color-accent-red)]">
                  {error}
                </div>
              )}
              <EmailList
                threads={threads}
                activeFolder={activeFolder}
                selectedThreadId={selectedThreadId}
                onSelectThread={setSelectedThreadId}
                onThreadsChange={setThreads}
              />
              {pagination && pageRef.current < pagination.totalPages && (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="border-t border-[var(--color-hairline)] py-3 text-xs text-[var(--color-charcoal)] transition hover:text-[var(--color-ink)]"
                >
                  {loading ? "Loading..." : "Load more"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <ComposeModal
        isOpen={showCompose}
        onClose={handleComposeClose}
        {...composeData}
      />
    </div>
  );
}
