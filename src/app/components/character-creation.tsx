"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export default function CharacterCreation() {
  const [name, setName] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("");
  const [religion, setReligion] = useState("");
  const [language, setLanguage] = useState("");
  const [notes, setNotes] = useState("");

  const createCharacter = api.character.create.useMutation({
    onSuccess: () => {
      // Reset form
      setName("");
      setRegion("");
      setStatus("");
      setReligion("");
      setLanguage("");
      setNotes("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    createCharacter.mutate({
      name: name.trim(),
      region: region.trim() || undefined,
      status: status.trim() || undefined,
      religion: religion.trim() || undefined,
      language: language.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-white p-6 shadow-md">
      <h2 className="mb-6 text-2xl font-bold text-gray-800">
        Create Character
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter character name"
            required
          />
        </div>

        <div>
          <label
            htmlFor="region"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Region
          </label>
          <input
            type="text"
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter region"
          />
        </div>

        <div>
          <label
            htmlFor="status"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Status
          </label>
          <input
            type="text"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter status"
          />
        </div>

        <div>
          <label
            htmlFor="religion"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Religion
          </label>
          <input
            type="text"
            id="religion"
            value={religion}
            onChange={(e) => setReligion(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter religion"
          />
        </div>

        <div>
          <label
            htmlFor="language"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Language
          </label>
          <input
            type="text"
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter language"
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter notes"
          />
        </div>

        <button
          type="submit"
          disabled={createCharacter.isPending}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createCharacter.isPending ? "Creating..." : "Create Character"}
        </button>
      </form>
    </div>
  );
}
