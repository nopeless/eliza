import { Extends, assert } from "tsafe";
import type {
  RoleManager as DjsRoleManager,
  Role as DjsRole,
} from "discord.js";
import { Collection, Snowflake } from "discord.js";

/**
 * Abstraction layer for role manager
 */

export interface IRole {
  id: Snowflake;
  name: string;
  readonly position: number;
  readonly rawPosition: number;
}

export interface IRoleManager {
  setPosition(role: IRole | Snowflake, position: number): Promise<unknown>;
  setPositions(
    rolePositions: readonly { role: IRole | Snowflake; position: number }[]
  ): Promise<unknown>;

  // CRUD lmao
  create(opts: { position: number }): Promise<IRole>;
  fetch(id: Snowflake): Promise<IRole | null>;
  fetch(id: undefined): Promise<Collection<Snowflake, IRole>>;
  delete(role: IRole | Snowflake): Promise<void>;
  edit(role: IRole | Snowflake, opts: { position: number }): Promise<IRole>;
}

// not actually running block, just for type checking
assert<Extends<DjsRole, IRole>>;
assert<Extends<DjsRoleManager, IRoleManager>>;
