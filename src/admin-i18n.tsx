import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "en" | "fa";

export const translations = {
  en: {
    // Navbar / Toggle
    "lang_toggle_en": "EN",
    "lang_toggle_fa": "فا",
    "nav_back_to_blog": "Back to Blog",
    "nav_console": "Console",
    "nav_logout": "Log Out",
    
    // Login Screen
    "login_title": "Admin Console",
    "login_subtitle": "Log in with your pre-seeded administrator credentials",
    "login_email": "Email Address",
    "login_password": "Password",
    "login_btn": "Log In",
    "login_authenticating": "Authenticating...",
    "login_default_credentials": "Default sandbox login: admin@betavan.ir / admin123",
    "login_error_failed": "Login verification failed",
    "login_error_invalid": "Invalid credentials",

    // Dashboard Screen
    "dashboard_title": "Admin Console",
    "dashboard_subtitle": "Manage all editorial posts, categories, tags, and static content",
    "dashboard_new_post": "Write New Post",
    "dashboard_tab_articles": "Articles",
    "dashboard_tab_categories": "Categories",
    "dashboard_tab_tags": "Tags",
    "dashboard_table_title": "Title",
    "dashboard_table_category": "Category",
    "dashboard_table_tags": "Tags",
    "dashboard_table_status": "Status",
    "dashboard_table_date": "Date",
    "dashboard_table_actions": "Actions",
    "dashboard_no_posts": "No posts found. Start by writing your first article!",
    "dashboard_uncategorized": "Uncategorized",
    "dashboard_preview": "Preview article",
    "dashboard_edit": "Edit article",
    "dashboard_delete": "Delete article",
    "dashboard_delete_confirm": "Are you sure you want to delete this article?",
    "dashboard_add_category_placeholder": "New Category Name (e.g. AI Tutorials)",
    "dashboard_add_category_btn": "Add Category",
    "dashboard_add_tag_placeholder": "New Tag Name (e.g. ChatGPT)",
    "dashboard_add_tag_btn": "Add Tag",
    "dashboard_loading": "Loading dashboard data...",

    // Edit Post Screen
    "edit_back_btn": "Back to Console",
    "edit_new_title": "Creating New Article",
    "edit_editing_title": "Editing",
    "edit_article_title": "Article Title",
    "edit_article_title_placeholder": "Aparat embeds inside blog post tutorials...",
    "edit_slug": "Slug URL",
    "edit_slug_placeholder": "aparat-embeds-tutorial",
    "edit_cover_img": "Featured Cover Image URL",
    "edit_excerpt": "Short Excerpt",
    "edit_excerpt_placeholder": "Write a highly concise summary of the article...",
    "edit_status_title": "Status & Publishing",
    "edit_status_label": "Publication State",
    "edit_status_draft": "Draft",
    "edit_status_published": "Publish Now",
    "edit_category_label": "Category",
    "edit_tags_label": "Article Tags",
    "edit_seo_options": "SEO Meta Options",
    "edit_seo_title": "SEO Title",
    "edit_seo_description": "SEO Description",
    "edit_og_image": "OG Share Image URL",
    "edit_save_btn": "Save Article Structure",
    "edit_saving": "Saving updates...",
    "edit_loading": "Loading post details...",

    // Block Editor Labels
    "blocks_title": "Article Body Blocks",
    "blocks_count": "blocks configured",
    "blocks_empty": "Your article has no blocks yet. Click any button below to build one!",
    "blocks_move_up": "Move block up",
    "blocks_move_down": "Move block down",
    "blocks_delete": "Delete block",
    "blocks_insert_title": "Insert New Block",
    "blocks_type_rich_text": "Rich Text",
    "blocks_type_image": "Image",
    "blocks_type_aparat_embed": "Aparat Video",
    "blocks_type_code_snippet": "Code Snippet",
    "blocks_type_download_box": "Download Box",
    
    "blocks_img_url": "Image URL",
    "blocks_img_alt": "Alt Text",
    "blocks_img_caption": "Caption",
    "blocks_video_id": "Aparat Video ID or URL",
    "blocks_video_title": "Video Title (optional)",
    "blocks_code_editor": "Code Editor",
    "blocks_file_name": "Filename",
    "blocks_file_size": "File Size",
    "blocks_file_link": "Download Link / File URL",
    "blocks_file_desc": "Short File Description",
    "blocks_browse_media": "Browse Media Library",

    // Media Modal Labels
    "media_title": "Media Library",
    "media_subtitle": "Upload or select visual assets & downloadable files",
    "media_upload_title": "Upload File",
    "media_folder_placeholder": "Folder (e.g. general)",
    "media_tags_placeholder": "Tags (comma-separated)",
    "media_alt_placeholder": "Alt Description",
    "media_upload_btn_uploading": "Uploading...",
    "media_upload_btn_select": "Select & Upload",
    "media_filter_title": "Filters",
    "media_folder_all": "All Folders",
    "media_folder_general": "General",
    "media_folder_downloads": "Downloads",
    "media_search_placeholder": "Search media...",
    "media_empty": "No media assets found matching the criteria.",
    "media_select_asset": "Select Asset",
    "media_loading": "Retrieving media library assets...",
    "media_drag_drop": "Select File or Drag & Drop"
  },
  fa: {
    // Navbar / Toggle
    "lang_toggle_en": "EN",
    "lang_toggle_fa": "فا",
    "nav_back_to_blog": "بازگشت به وبلاگ",
    "nav_console": "پیشخوان",
    "nav_logout": "خروج",

    // Login Screen
    "login_title": "پیشخوان مدیریت",
    "login_subtitle": "با شناسه‌های کاربری پیش‌فرض مدیر وارد شوید",
    "login_email": "نشانی ایمیل",
    "login_password": "گذرواژه",
    "login_btn": "ورود",
    "login_authenticating": "در حال احراز هویت...",
    "login_default_credentials": "ورود آزمایشی پیش‌فرض: admin@betavan.ir / admin123",
    "login_error_failed": "احراز هویت با خطا مواجه شد",
    "login_error_invalid": "اطلاعات کاربری نامعتبر است",

    // Dashboard Screen
    "dashboard_title": "پیشخوان مدیریت",
    "dashboard_subtitle": "مدیریت پست‌های تحریریه، دسته‌بندی‌ها، برچسب‌ها و محتوای ثابت",
    "dashboard_new_post": "نوشتن پست جدید",
    "dashboard_tab_articles": "مقاله‌ها",
    "dashboard_tab_categories": "دسته‌بندی‌ها",
    "dashboard_tab_tags": "برچسب‌ها",
    "dashboard_table_title": "عنوان",
    "dashboard_table_category": "دسته‌بندی",
    "dashboard_table_tags": "برچسب‌ها",
    "dashboard_table_status": "وضعیت",
    "dashboard_table_date": "تاریخ",
    "dashboard_table_actions": "عملیات",
    "dashboard_no_posts": "هیچ مقاله یا پستی یافت نشد. با نوشتن اولین مقاله خود شروع کنید!",
    "dashboard_uncategorized": "بدون دسته‌بندی",
    "dashboard_preview": "پیش‌نمایش مقاله",
    "dashboard_edit": "ویرایش مقاله",
    "dashboard_delete": "حذف مقاله",
    "dashboard_delete_confirm": "آیا از حذف این مقاله اطمینان دارید؟",
    "dashboard_add_category_placeholder": "نام دسته‌بندی جدید (مانند: آموزش‌های هوش مصنوعی)",
    "dashboard_add_category_btn": "افزودن دسته‌بندی",
    "dashboard_add_tag_placeholder": "نام برچسب جدید (مانند: ChatGPT)",
    "dashboard_add_tag_btn": "افزودن برچسب",
    "dashboard_loading": "در حال بارگذاری داده‌های پیشخوان...",

    // Edit Post Screen
    "edit_back_btn": "بازگشت به پیشخوان",
    "edit_new_title": "ایجاد مقاله جدید",
    "edit_editing_title": "در حال ویرایش",
    "edit_article_title": "عنوان مقاله",
    "edit_article_title_placeholder": "افزودن ویدیو آپارات به پست‌های وبلاگ...",
    "edit_slug": "شناسه URL (اسلاگ)",
    "edit_slug_placeholder": "aparat-embeds-tutorial",
    "edit_cover_img": "آدرس تصویر شاخص",
    "edit_excerpt": "خلاصه کوتاه پست",
    "edit_excerpt_placeholder": "خلاصه و چکیده‌ای بسیار کوتاه از مقاله را بنویسید...",
    "edit_status_title": "وضعیت و انتشار",
    "edit_status_label": "وضعیت انتشار پست",
    "edit_status_draft": "پیش‌نویس",
    "edit_status_published": "انتشار فوری",
    "edit_category_label": "دسته‌بندی",
    "edit_tags_label": "برچسب‌های مقاله",
    "edit_seo_options": "تنظیمات متای سئو",
    "edit_seo_title": "عنوان سئو",
    "edit_seo_description": "توضیحات متای سئو",
    "edit_og_image": "آدرس تصویر اشتراک‌گذاری (OG)",
    "edit_save_btn": "ذخیره ساختار مقاله",
    "edit_saving": "در حال ذخیره تغییرات...",
    "edit_loading": "در حال بارگذاری جزئیات پست...",

    // Block Editor Labels
    "blocks_title": "بخش‌های بدنه مقاله",
    "blocks_count": "بخش تنظیم شده",
    "blocks_empty": "مقاله شما هنوز هیچ بخشی ندارد. برای اضافه کردن بخش جدید، بر روی دکمه‌های زیر کلیک کنید!",
    "blocks_move_up": "انتقال بخش به بالا",
    "blocks_move_down": "انتقال بخش به پایین",
    "blocks_delete": "حذف بخش",
    "blocks_insert_title": "درج بخش جدید در مقاله",
    "blocks_type_rich_text": "متن غنی",
    "blocks_type_image": "تصویر",
    "blocks_type_aparat_embed": "ویدیو آپارات",
    "blocks_type_code_snippet": "قطعه کد",
    "blocks_type_download_box": "جعبه دانلود",
    
    "blocks_img_url": "آدرس تصویر",
    "blocks_img_alt": "متن جایگزین (Alt)",
    "blocks_img_caption": "توضیح تصویر (کپشن)",
    "blocks_video_id": "شناسه یا لینک ویدیوی آپارات",
    "blocks_video_title": "عنوان ویدیو (اختیاری)",
    "blocks_code_editor": "ویرایشگر قطعه کد",
    "blocks_file_name": "نام فایل",
    "blocks_file_size": "اندازه فایل",
    "blocks_file_link": "لینک دانلود یا آدرس فایل",
    "blocks_file_desc": "توضیحات کوتاه فایل دانلودی",
    "blocks_browse_media": "مرور کتابخانه چندرسانه‌ای",

    // Media Modal Labels
    "media_title": "کتابخانه رسانه",
    "media_subtitle": "بارگذاری یا انتخاب تصاویر و فایل‌های دانلودی",
    "media_upload_title": "بارگذاری فایل جدید",
    "media_folder_placeholder": "نام پوشه (مانند: general)",
    "media_tags_placeholder": "برچسب‌ها (با کاما جدا کنید)",
    "media_alt_placeholder": "توضیح متنی تصویر (Alt)",
    "media_upload_btn_uploading": "در حال بارگذاری فایل...",
    "media_upload_btn_select": "انتخاب و بارگذاری",
    "media_filter_title": "فیلترهای رسانه",
    "media_folder_all": "همه پوشه‌ها",
    "media_folder_general": "عمومی (General)",
    "media_folder_downloads": "دانلودها (Downloads)",
    "media_search_placeholder": "جستجوی فایل‌ها...",
    "media_empty": "هیچ فایلی مطابق با فیلترها پیدا نشد.",
    "media_select_asset": "انتخاب رسانه",
    "media_loading": "در حال دریافت دارایی‌های کتابخانه رسانه...",
    "media_drag_drop": "انتخاب فایل یا کشیدن و رها کردن در این بخش"
  }
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("betavan_admin_locale");
    if (stored === "fa" || stored === "en") {
      return stored as Locale;
    }
    return "en";
  });

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("betavan_admin_locale", newLocale);
  };

  const t = (key: string): string => {
    const dict = translations[locale];
    // Return key translation or fallback to English key, then key itself
    return (dict as any)[key] || (translations.en as any)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
