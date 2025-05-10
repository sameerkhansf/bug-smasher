import { create } from "zustand";
import { bugs as mockBugs } from "./mock/bugs";
import { users as mockUsers } from "./mock/users";
import { Bug } from "./types/bug";

/**
 * Zustand store for Bug Basher app state.
 *
 * State:
 *   - bugs: Array of Bug objects (active and squashed)
 *   - users: Array of user objects (with bounty, score, etc.)
 *   - activeUserId: ID of the current user
 *   - inspectedId: ID of the bug currently inspected (for modal)
 *
 * Actions:
 *   - inspectBug(id): Set the inspected bug for modal display
 *   - squashBug(id): Mark a bug as squashed and award bounty to user
 */

interface State {
	bugs: Bug[];
	users: any[]; // Using any for now since we don't have the exact User type
	activeUserId: string;
	inspectedId: string | null;
	inspectBug: (id: string) => void;
	squashBug: (id: string) => void;
}

export const useBugStore = create<State>((set) => ({
	bugs: mockBugs,
	users: mockUsers.sort((a, b) => b.bounty - a.bounty),
	activeUserId: "u1", // assume first user is the current hacker
	inspectedId: null,
	inspectBug: (id) => set({ inspectedId: id }),
	squashBug: (id) =>
		set((state) => {
			// mark bug inactive + award bounty
			let updatedBug: Bug | undefined;
			const bugs = state.bugs.map((b) => {
				if (b.id === id && b.active) {
					updatedBug = { ...b, active: false };
					return updatedBug;
				}
				return b;
			});

			const users = updatedBug
				? state.users
						.map((u) =>
							u.id === state.activeUserId
								? {
										...u,
										score: (u.score || 0) + (updatedBug!.bounty || 0),
										bugsSquashed: [...(u.bugsSquashed || []), updatedBug!.id],
								  }
								: u
						)
						.sort((a, b) => (b.score || b.bounty) - (a.score || a.bounty))
				: state.users;

			return { bugs, users, inspectedId: null };
		}),
}));
