"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function CharactersPage() {
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data: characters, refetch } = api.character.list.useQuery();
  const deleteCharacter = api.character.delete.useMutation({
    onSuccess: async () => {
      await refetch();
      setDeleteConfirm(null);
    },
  });

  const handleDelete = (characterId: number) => {
    deleteCharacter.mutate({ id: characterId });
  };

  if (!characters) {
    return (
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="container mx-auto">
          <div className="text-center">Loading characters...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Characters</h1>
          <Link
            href="/test-character"
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create New Character
          </Link>
        </div>

        {characters.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No characters found</div>
            <Link
              href="/test-character"
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Create Your First Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters.map((character) => (
              <div key={character.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-gray-800">{character.name}</h2>
                  <div className="flex space-x-2">
                    <Link
                      href={`/characters/${character.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(character.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {character.region && <div>Region: {character.region}</div>}
                  {character.status && <div>Status: {character.status}</div>}
                  {character.religion && <div>Religion: {character.religion}</div>}
                  {character.language && <div>Language: {character.language}</div>}
                </div>

                {character.stats && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2">Statistics</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>VIT: {character.stats.vitCurrent}/{character.stats.vitMax}</div>
                      <div>DEX: {character.stats.dexCurrent}/{character.stats.dexMax}</div>
                      <div>WIS: {character.stats.wisCurrent}/{character.stats.wisMax}</div>
                      <div>CHA: {character.stats.chaCurrent}/{character.stats.chaMax}</div>
                      <div>HP: {character.stats.hpCurrent}/{character.stats.hpMax}</div>
                      <div>AC: {character.stats.acCurrent}/{character.stats.acMax}</div>
                    </div>
                  </div>
                )}

                {character.classes && character.classes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-2">Classes</h3>
                    <div className="text-sm text-gray-600">
                      {character.classes.map((cls, index) => (
                        <span key={cls.id}>
                          {cls.className} {cls.level}
                          {index < character.classes.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {deleteConfirm === character.id && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm text-red-800 mb-2">
                      Are you sure you want to delete {character.name}?
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleDelete(character.id)}
                        disabled={deleteCharacter.isPending}
                        className="bg-red-600 text-white py-1 px-3 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleteCharacter.isPending ? "Deleting..." : "Yes, Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="bg-gray-600 text-white py-1 px-3 rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 