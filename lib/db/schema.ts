import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { desc, type InferSelectModel } from "drizzle-orm";
import { create } from "domain";

// 定义用户表
// export const user = sqliteTable("user", {
//   id: text("id").primaryKey().notNull(),
//   email: text("email", { length: 64 }).notNull().unique(),
//   password: text("password", { length: 64 }).notNull(),
// });
export const user = sqliteTable("user", {
  id: text("id").primaryKey().notNull(),
  email: text("email", { length: 64 }).notNull().unique(),
  password: text("password", { length: 64 }).notNull(),
});

export const chat = sqliteTable("chat", {
  id: text("id").primaryKey().notNull(),
  createdAt: integer("createdAt").notNull(),
  title: text("title").notNull(),
  userId: text("userId"),
  // visibility: text("visibility", { enum: ["public", "private"] }).notNull(),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = sqliteTable("message", {
  id: text("id").primaryKey().notNull(),
  chatId: text("chatId").notNull(),
  role: text("role", { enum: ["user", "assistant"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export type Message = InferSelectModel<typeof message>;

// export const document = sqliteTable(
//   "document",
//   {
//     id: text("id").notNull(),
//     createAt: integer("createAt").notNull(),
//     title: text("title").notNull(),
//     content: text("content"),
//     kind: text("kind", { enum: ["text", "code"] })
//       .notNull()
//       .default("text"),
//     userId: text("userId")
//       .notNull()
//       .references(() => user.id),
//   },
//   (document) => ({
//     pk: primaryKey(document.id, document.createAt),
//   })
// );

// export type Document = InferSelectModel<typeof document>;

// export const suggestion = sqliteTable(
//   "suggestion",
//   {
//     id: text("id").primaryKey().notNull(),
//     documentId: text("documentId")
//       .notNull()
//       .references(() => document.id),
//     documentCreateAt: integer("documentCreateAt").notNull(),
//     originalText: text("originalText").notNull(),
//     suggestedText: text("suggestedText").notNull(),
//     description: text("description"),
//     isResolved: integer("isResolved").default(0),
//     userId: text("userId")
//       .notNull()
//       .references(() => user.id),
//     createAt: integer("createAt").notNull(),
//   },
//   (suggestion) => ({
//     pk: primaryKey(suggestion.id),
//     documentRed: foreignKey(suggestion.documentId, suggestion.documentCreateAt),
//   })
// );

// export type Suggestion = InferSelectModel<typeof suggestion>;

// export const vote = sqliteTable(
//   "vote",
//   {
//     chatId: text("chatId")
//       .notNull()
//       .references(() => chat.id),
//     messageId: text("messageId")
//       .notNull()
//       .references(() => message.id),
//     isUpvoted: integer("isUpvoted").notNull(),
//   },
//   (vote) => {
//     return {
//       pk: primaryKey(vote.chatId, vote.messageId),
//     };
//   }
// );

// export type Vote = InferSelectModel<typeof vote>;
