import { useState, useEffect, useCallback } from "react";

export default function Playground() {
  const [code, setCode] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [correctedCode, setCorrectedCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Debounced API Call
  const fetchSuggestions = useCallback(() => {
    if (code.length > 1) {
      setLoading(true);
      fetch("http://localhost:8000/autocomplete/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      })
        .then((response) => response.json())
        .then((data) => setSuggestions(data.suggestions || []))
        .catch((error) => console.error("Error fetching suggestions:", error))
        .finally(() => setLoading(false));
    } else {
      setSuggestions([]);
    }
  }, [code]);

  useEffect(() => {
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [code, fetchSuggestions]);

  const fetchCorrection = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/correct/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      setCorrectedCode(data.corrected_code || "No correction available");
    } catch (error) {
      console.error("Error fetching correction:", error);
      setCorrectedCode("Error fetching correction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Side: Code Editor */}
      <div className="w-2/3 p-6 border-r border-gray-700">
        <h1 className="text-2xl font-bold mb-4">Darion Playground</h1>
        <textarea
          className="w-full h-64 p-3 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Start typing Darion code..."
        />
        <div className="mt-3">
          {loading && <p className="text-yellow-400 text-sm">Fetching suggestions...</p>}
          {suggestions.length > 0 && (
            <div className="p-3 bg-gray-700 rounded-lg text-sm border border-gray-600 mt-2">
              <strong>Suggestions:</strong> {suggestions.join(", ")}
            </div>
          )}
        </div>
        <button
          onClick={fetchCorrection}
          className="mt-4 bg-blue-600 hover:bg-blue-500 transition-colors p-3 rounded-lg w-full font-semibold"
          disabled={loading}
        >
          {loading ? "Processing..." : "Correct Code"}
        </button>
      </div>

      {/* Right Side: Dialog Box for Corrected Code */}
      <div className="w-1/3 flex items-center justify-center p-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 w-full">
          <h2 className="text-xl font-semibold text-green-400">Corrected Code</h2>
          <div className="mt-3 p-4 bg-green-700 text-green-100 rounded-lg min-h-[120px] border border-green-500">
            {correctedCode || "No corrections yet"}
          </div>
        </div>
      </div>
    </div>
  );
}
