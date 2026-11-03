-- 테이블·컬럼 이름을 snake_case로 변경 (데이터 유지를 위해 RENAME 사용)

-- users
ALTER TABLE "User" RENAME TO "users";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "users" RENAME CONSTRAINT "User_pkey" TO "users_pkey";

-- auth_accounts
ALTER TABLE "AuthAccount" RENAME TO "auth_accounts";
ALTER TABLE "auth_accounts" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "auth_accounts" RENAME COLUMN "providerAccountId" TO "provider_account_id";
ALTER TABLE "auth_accounts" RENAME COLUMN "providerEmail" TO "provider_email";
ALTER TABLE "auth_accounts" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "auth_accounts" RENAME CONSTRAINT "AuthAccount_pkey" TO "auth_accounts_pkey";
ALTER TABLE "auth_accounts" RENAME CONSTRAINT "AuthAccount_userId_fkey" TO "auth_accounts_user_id_fkey";
ALTER INDEX "AuthAccount_provider_providerAccountId_key" RENAME TO "auth_accounts_provider_provider_account_id_key";

-- categories
ALTER TABLE "Category" RENAME TO "categories";
ALTER TABLE "categories" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "categories" RENAME COLUMN "normalizedName" TO "normalized_name";
ALTER TABLE "categories" RENAME COLUMN "isHidden" TO "is_hidden";
ALTER TABLE "categories" RENAME COLUMN "sortOrder" TO "sort_order";
ALTER TABLE "categories" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "categories" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "categories" RENAME CONSTRAINT "Category_pkey" TO "categories_pkey";
ALTER TABLE "categories" RENAME CONSTRAINT "Category_userId_fkey" TO "categories_user_id_fkey";
ALTER INDEX "Category_userId_normalizedName_key" RENAME TO "categories_user_id_normalized_name_key";
ALTER INDEX "Category_userId_isHidden_sortOrder_idx" RENAME TO "categories_user_id_is_hidden_sort_order_idx";

-- actions
ALTER TABLE "Action" RENAME TO "actions";
ALTER TABLE "actions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "actions" RENAME COLUMN "categoryId" TO "category_id";
ALTER TABLE "actions" RENAME COLUMN "normalizedName" TO "normalized_name";
ALTER TABLE "actions" RENAME COLUMN "defaultDurationMinutes" TO "default_duration_minutes";
ALTER TABLE "actions" RENAME COLUMN "durationStepMinutes" TO "duration_step_minutes";
ALTER TABLE "actions" RENAME COLUMN "isHidden" TO "is_hidden";
ALTER TABLE "actions" RENAME COLUMN "sortOrder" TO "sort_order";
ALTER TABLE "actions" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "actions" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "actions" RENAME CONSTRAINT "Action_pkey" TO "actions_pkey";
ALTER TABLE "actions" RENAME CONSTRAINT "Action_userId_fkey" TO "actions_user_id_fkey";
ALTER TABLE "actions" RENAME CONSTRAINT "Action_categoryId_fkey" TO "actions_category_id_fkey";
ALTER INDEX "Action_categoryId_normalizedName_key" RENAME TO "actions_category_id_normalized_name_key";
ALTER INDEX "Action_userId_categoryId_isHidden_sortOrder_idx" RENAME TO "actions_user_id_category_id_is_hidden_sort_order_idx";

-- records
ALTER TABLE "Record" RENAME TO "records";
ALTER TABLE "records" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "records" RENAME COLUMN "actionId" TO "action_id";
ALTER TABLE "records" RENAME COLUMN "recordDate" TO "record_date";
ALTER TABLE "records" RENAME COLUMN "durationMinutes" TO "duration_minutes";
ALTER TABLE "records" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "records" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "records" RENAME CONSTRAINT "Record_pkey" TO "records_pkey";
ALTER TABLE "records" RENAME CONSTRAINT "Record_userId_fkey" TO "records_user_id_fkey";
ALTER TABLE "records" RENAME CONSTRAINT "Record_actionId_fkey" TO "records_action_id_fkey";
ALTER INDEX "Record_userId_recordDate_idx" RENAME TO "records_user_id_record_date_idx";
ALTER INDEX "Record_userId_actionId_recordDate_createdAt_idx" RENAME TO "records_user_id_action_id_record_date_created_at_idx";

-- user_settings
ALTER TABLE "UserSetting" RENAME TO "user_settings";
ALTER TABLE "user_settings" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "user_settings" RENAME COLUMN "recordSortOrder" TO "record_sort_order";
ALTER TABLE "user_settings" RENAME COLUMN "lastSelectedCategoryId" TO "last_selected_category_id";
ALTER TABLE "user_settings" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "user_settings" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "user_settings" RENAME CONSTRAINT "UserSetting_pkey" TO "user_settings_pkey";
ALTER TABLE "user_settings" RENAME CONSTRAINT "UserSetting_userId_fkey" TO "user_settings_user_id_fkey";
ALTER TABLE "user_settings" RENAME CONSTRAINT "UserSetting_lastSelectedCategoryId_fkey" TO "user_settings_last_selected_category_id_fkey";
ALTER INDEX "UserSetting_userId_key" RENAME TO "user_settings_user_id_key";
