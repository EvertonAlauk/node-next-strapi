'use strict';

// Titles must be unique at database level too, so two requests cannot save the same title at once.
// The API also checks first and turns the database error into a friendly message.
module.exports = {
  async up(knex) {
    await knex.schema.alterTable('posts', (table) => {
      table.unique(['title'], 'posts_title_unique');
    });
  },
  async down(knex) {
    await knex.schema.alterTable('posts', (table) => {
      table.dropUnique(['title'], 'posts_title_unique');
    });
  },
};
