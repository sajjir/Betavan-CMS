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
    "media_drag_drop": "Select File or Drag & Drop",

    // Navbar
    "nav_home": "Home",
    "nav_login": "Log In",

    // Public Blog Home
    "home_title_badge": "// Technical Workshop & Snippets",
    "home_hero_title": "Stop starting from scratch. Grab working code & assets.",
    "home_hero_subtitle": "Betavan.ir is a zero-friction playground for web automation, custom AI integrations, and high-performance WordPress snippet files. Built for builders who need things working in seconds.",
    "home_btn_browse": "Browse Toolbench",
    "home_btn_pillars": "Explore Pillars",
    "home_featured_badge": "Featured Asset",
    "home_demo_badge": "Demo Snippet",
    "home_demo_title": "Dequeue Gutenberg CSS blocks on frontend",
    "home_demo_excerpt": "Instantly speed up WordPress sites by preventing Gutenberg assets from loading on non-block landing pages.",
    "home_demo_copy": "Copy Snippet",
    "home_demo_copied": "Copied!",
    "home_snippet_language": "Source language",
    "home_copy_snippet": "Copy Snippet",
    "home_copied": "Copied!",
    "home_view_snippet": "[ View Complete File Snippet ]",
    "home_download_stats": "Size",
    "home_btn_download": "Download Asset",
    "home_explore_tutorial": "Explore this tutorial series",
    "home_pillars_badge": "// Core Toolbench Pillars",
    "home_pillars_title": "Select Your Workspace",
    "home_pillars_subtitle": "We organize our snippets, files, and video guides into three high-focus functional disciplines.",
    "home_pillar_ai_title": "AI & Technology",
    "home_pillar_ai_desc": "API connections, automation scripts, and LLM prompt layouts to supercharge your systems.",
    "home_pillar_ai_btn": "Browse AI Snippets →",
    "home_pillar_business_title": "Business & Entrepreneurship",
    "home_pillar_business_desc": "WordPress snippets, micro-SaaS structures, and clean code configurations for developers.",
    "home_pillar_business_btn": "Browse business snippets →",
    "home_pillar_marketing_title": "Marketing & Automation",
    "home_pillar_marketing_desc": "Analytics triggers, utility landing scripts, and SEO configurations to drive performance.",
    "home_pillar_marketing_btn": "Browse marketing assets →",

    // Toolbench Filter & List
    "home_all_publications": "All Publications",
    "home_clear_filters": "[ Clear Filters ]",
    "home_reading_state": "Reading toolbench state...",
    "home_empty_filter": "No active assets found under the selected filter.",
    "home_show_all": "Show all publications",
    "home_video_tutorial_badge": "VIDEO TUTORIAL",
    "home_get_asset": "Get Asset",
    "home_filter_by_tag": "Filter by Tag",
    "home_all_tags": "All Tags",
    "home_about_badge": "// ABOUT THE WORKSHOP",
    "home_about_desc": "Every resource on Betavan is thoroughly tested before seeding. Code blocks can be deployed immediately in WordPress, Node, and automation clients like n8n or Python.",
    "home_about_active": "V2.0 Core Active",

    // Single Post
    "post_back_link": "← BACK TO TOOLBENCH",
    "post_published_on": "Published on",
    "post_by": "By",
    "post_min_read": "min read",
    "post_draft_mode": "Draft Mode",
    "post_related_title": "// Related Publications",
    "post_related_subtitle": "Continue reading in",
    "post_not_found": "Unable to load article",
    "post_not_found_desc": "Article does not exist",
    "post_return_btn": "Return to directory",
    "post_fetch_details": "Fetching publication details...",

    // Block Renderer
    "block_free_download": "FREE DOWNLOAD",
    "block_trigger_download": "Trigger Free Download",
    "block_invalid_video": "Invalid Aparat Video ID",
    "block_attachment_file": "Attachment File",
    "block_unknown_size": "Unknown Size",
    "block_downloads_count": "downloads",
    "footer_copyright": "Developed by Betavan. All content and files are open.",

    // Custom Category Management & Settings Admin UI
    "nav_admin_posts": "Posts",
    "nav_admin_categories": "Categories",
    "nav_admin_settings": "Settings",
    "nav_admin_tags": "Tags",
    "nav_admin_pages": "Pages",
    "categories_title": "Category Hierarchy Management",
    "categories_subtitle": "Manage parent and subcategory relationships. Click subcategories to collapse/expand them.",
    "categories_new_root": "New Root Category",
    "categories_add_sub": "Add Subcategory",
    "categories_edit": "Edit",
    "categories_delete": "Delete",
    "categories_parent": "Parent Category",
    "categories_none_root": "None (Root Category)",
    "categories_name": "Category Name",
    "categories_slug": "Slug (optional)",
    "categories_cancel": "Cancel",
    "categories_save": "Save Changes",
    "categories_create": "Create Category",
    "categories_delete_confirm_title": "Delete Category: {name}",
    "categories_delete_warning": "Warning: Deleting this category will promote its {subCount} child categories to {parentName} and affect {postCount} posts.",
    "categories_delete_reassign": "Reassign posts to:",
    "categories_delete_uncategorized": "Leave Uncategorized",
    "categories_delete_btn": "Confirm Delete",
    "settings_title": "Security & Admin Settings",
    "settings_subtitle": "Rotate your administrator password from the web console safely.",
    "settings_current_pass": "Current Password",
    "settings_new_pass": "New Password",
    "settings_confirm_pass": "Confirm New Password",
    "settings_change_btn": "Update Security Password",
    "settings_success": "Password changed successfully!",
    "settings_error_mismatch": "New password confirmation does not match.",
    "tags_title": "Tag Management",
    "tags_subtitle": "Manage blog tags. These tags categorize posts and help search engine discovery.",
    "tags_new": "New Tag",
    "tags_edit": "Edit Tag",
    "tags_name": "Tag Name",
    "tags_slug": "Slug (optional)",
    "tags_delete_confirm": "Are you sure you want to delete this tag? This action is permanent, and it will be unassigned from all posts.",
    "tags_create_btn": "Create Tag",
    "pages_title": "Static Pages Management",
    "pages_subtitle": "Manage public static pages like About, Contact, or Services.",
    "pages_new": "New Page",
    "pages_edit": "Edit Page",
    "pages_name": "Page Title",
    "pages_slug": "Page Slug (URL)",
    "pages_delete_confirm": "Are you sure you want to delete this page? This will immediately remove it from public view.",
    "pages_last_updated": "Last Updated",
    "pages_create_btn": "Create Page",
    "pages_blocks_editor": "Page Content (Blocks Editor)",
    "pages_seo_title": "SEO Title",
    "pages_seo_desc": "SEO Description"
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
    "media_drag_drop": "انتخاب فایل یا کشیدن و رها کردن در این بخش",

    // Navbar
    "nav_home": "خانه",
    "nav_login": "ورود",

    // Public Blog Home
    "home_title_badge": "// کارگاه فنی و قطعه کدهای آماده",
    "home_hero_title": "چرخ را از اول اختراع نکنید. کدهای آماده و تست‌شده را بردارید.",
    "home_hero_subtitle": "بتوان یک محیط بدون دردسر برای اتوماسیون وب، یکپارچه‌سازی هوش مصنوعی و کدهای آماده وردپرس با کارایی بالاست. ساخته شده برای توسعه‌دهندگانی که می‌خواهند پروژه‌شان در چند ثانیه کار کند.",
    "home_btn_browse": "مرور ابزارها و کدهای آماده",
    "home_btn_pillars": "بررسی دسته‌بندی‌های اصلی",
    "home_featured_badge": "دارایی شاخص",
    "home_demo_badge": "نمونه قطعه کد",
    "home_demo_title": "غیرفعال کردن استایل‌های Gutenberg در بخش کاربری وردپرس",
    "home_demo_excerpt": "سرعت سایت وردپرسی خود را با جلوگیری از لود فایل‌های سنگین گوتنبرگ در صفحات غیر بلاگ، فورا افزایش دهید.",
    "home_demo_copy": "کپی قطعه کد",
    "home_demo_copied": "کپی شد!",
    "home_snippet_language": "زبان منبع",
    "home_copy_snippet": "کپی قطعه کد",
    "home_copied": "کپی شد!",
    "home_view_snippet": "[ مشاهده قطعه کد کامل ]",
    "home_download_stats": "حجم",
    "home_btn_download": "دانلود فایل دارایی",
    "home_explore_tutorial": "مشاهده این مجموعه آموزشی",
    "home_pillars_badge": "// ستون‌های اصلی کارگاه توان",
    "home_pillars_title": "محیط کاری خود را انتخاب کنید",
    "home_pillars_subtitle": "کدها، فایل‌ها و ویدیوهای آموزشی ما در سه حوزه کاربردی با بازدهی بالا دسته‌بندی شده‌اند.",
    "home_pillar_ai_title": "هوش مصنوعی و فناوری",
    "home_pillar_ai_desc": "اتصالات API، اسکریپت‌های اتوماسیون و سناریوهای آماده LLM برای ارتقای سیستم‌های شما.",
    "home_pillar_ai_btn": "مرور کدهای هوش مصنوعی ←",
    "home_pillar_business_title": "کسب‌وکار و کارآفرینی",
    "home_pillar_business_desc": "قطعه کدهای وردپرس، ساختارهای میکروساس (Micro-SaaS) و پیکربندی‌های تمیز برای توسعه‌دهندگان.",
    "home_pillar_business_btn": "مرور کدهای کسب‌وکار ←",
    "home_pillar_marketing_title": "بازاریابی و اتوماسیون",
    "home_pillar_marketing_desc": "تریگرهای آنالیتیکس، اسکریپت‌های فرود کاربردی و ساختارهای متای سئو برای افزایش بازدهی.",
    "home_pillar_marketing_btn": "مرور دارایی‌های بازاریابی ←",

    // Toolbench Filter & List
    "home_all_publications": "همه انتشارات",
    "home_clear_filters": "[ پاک کردن فیلترها ]",
    "home_reading_state": "در حال خواندن وضعیت کارگاه ابزار...",
    "home_empty_filter": "هیچ محتوایی با فیلتر انتخاب‌شده یافت نشد.",
    "home_show_all": "نمایش همه انتشارات",
    "home_video_tutorial_badge": "آموزش ویدیویی",
    "home_get_asset": "دریافت فایل و کد",
    "home_filter_by_tag": "فیلتر بر اساس برچسب",
    "home_all_tags": "همه برچسب‌ها",
    "home_about_badge": "// درباره کارگاه توان",
    "home_about_desc": "تمام منابع در بتوان قبل از انتشار به طور کامل تست می‌شوند. کدهای آماده را می‌توان بلافاصله در وردپرس، نود جی‌اس و کلاینت‌های اتوماسیون مانند n8n یا پایتون استفاده کرد.",
    "home_about_active": "هسته فعال نسخه ۲.۰",

    // Single Post
    "post_back_link": "← بازگشت به کارگاه ابزار",
    "post_published_on": "منتشر شده در",
    "post_by": "توسط",
    "post_min_read": "دقیقه زمان مطالعه",
    "post_draft_mode": "حالت پیش‌نویس",
    "post_related_title": "// مطالب مرتبط",
    "post_related_subtitle": "ادامه مطالعه در دسته‌بندی",
    "post_not_found": "امکان بارگذاری مقاله وجود ندارد",
    "post_not_found_desc": "مقاله مورد نظر وجود ندارد",
    "post_return_btn": "بازگشت به فهرست",
    "post_fetch_details": "در حال دریافت جزئیات مقاله...",

    // Block Renderer
    "block_free_download": "دانلود رایگان",
    "block_trigger_download": "شروع دانلود رایگان",
    "block_invalid_video": "شناسه ویدیوی آپارات نامعتبر است",
    "block_attachment_file": "فایل ضمیمه",
    "block_unknown_size": "حجم نامشخص",
    "block_downloads_count": "دانلود",
    "footer_copyright": "توسعه‌یافته توسط بتوان. تمامی محتوا و فایل‌ها منبع‌باز و آزاد هستند.",

    // Custom Category Management & Settings Admin UI
    "nav_admin_posts": "پست‌ها",
    "nav_admin_categories": "دسته‌بندی‌ها",
    "nav_admin_settings": "تنظیمات",
    "nav_admin_tags": "برچسب‌ها",
    "nav_admin_pages": "برگه‌ها",
    "categories_title": "مدیریت سلسله‌مراتب دسته‌بندی‌ها",
    "categories_subtitle": "مدیریت ارتباط دسته‌بندی‌های والد و زیرمجموعه‌ها. برای باز یا بسته کردن روی آنها کلیک کنید.",
    "categories_new_root": "دسته‌بندی ریشه جدید",
    "categories_add_sub": "افزودن زیرمجموعه",
    "categories_edit": "ویرایش",
    "categories_delete": "حذف",
    "categories_parent": "دسته‌بندی والد",
    "categories_none_root": "هیچ‌کدام (دسته‌بندی ریشه)",
    "categories_name": "نام دسته‌بندی",
    "categories_slug": "شناسه URL (اسلاگ - اختیاری)",
    "categories_cancel": "لغو",
    "categories_save": "ذخیره تغییرات",
    "categories_create": "ایجاد دسته‌بندی",
    "categories_delete_confirm_title": "حذف دسته‌بندی: {name}",
    "categories_delete_warning": "هشدار: با حذف این دسته‌بندی، {subCount} زیرمجموعه آن به {parentName} ارتقا خواهند یافت و روی {postCount} پست تأثیر می‌گذارد.",
    "categories_delete_reassign": "انتساب مجدد پست‌ها به:",
    "categories_delete_uncategorized": "بدون دسته‌بندی رها شود",
    "categories_delete_btn": "تأیید حذف",
    "settings_title": "تنظیمات امنیتی و مدیریت",
    "settings_subtitle": "گذرواژه مدیریت خود را به صورت ایمن از این بخش تغییر دهید.",
    "settings_current_pass": "گذرواژه فعلی",
    "settings_new_pass": "گذرواژه جدید",
    "settings_confirm_pass": "تکرار گذرواژه جدید",
    "settings_change_btn": "به‌روزرسانی گذرواژه امنیتی",
    "settings_success": "گذرواژه با موفقیت تغییر یافت!",
    "settings_error_mismatch": "گذرواژه جدید و تکرار آن با یکدیگر همخوانی ندارند.",
    "tags_title": "مدیریت برچسب‌ها",
    "tags_subtitle": "برچسب‌های وبلاگ خود را به آسانی مدیریت کنید. این برچسب‌ها به یافتن و دسته‌بندی پست‌ها کمک می‌کنند.",
    "tags_new": "برچسب جدید",
    "tags_edit": "ویرایش برچسب",
    "tags_name": "نام برچسب",
    "tags_slug": "شناسه برچسب (اختیاری)",
    "tags_delete_confirm": "آیا از حذف این برچسب اطمینان دارید؟ این عمل غیرقابل بازگشت است و برچسب از تمام پست‌ها برداشته می‌شود.",
    "tags_create_btn": "ایجاد برچسب",
    "pages_title": "مدیریت برگه‌های ایستا",
    "pages_subtitle": "مدیریت برگه‌های ایستای عمومی مانند درباره ما، تماس با ما یا خدمات.",
    "pages_new": "برگه جدید",
    "pages_edit": "ویرایش برگه",
    "pages_name": "عنوان برگه",
    "pages_slug": "شناسه برگه (URL)",
    "pages_delete_confirm": "آیا از حذف این برگه اطمینان دارید؟ این عمل آن را بلافاصله از دید عمومی حذف خواهد کرد.",
    "pages_last_updated": "آخرین به‌روزرسانی",
    "pages_create_btn": "ایجاد برگه",
    "pages_blocks_editor": "محتوای برگه (ویرایشگر بلوک‌ها)",
    "pages_seo_title": "عنوان سئو",
    "pages_seo_desc": "توضیحات سئو"
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
    return "fa"; // Default to "fa" for primary Persian audience
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

  useEffect(() => {
    // Sync dir attribute on html/body tags
    const htmlDir = locale === "fa" ? "rtl" : "ltr";
    document.documentElement.dir = htmlDir;
  }, [locale]);

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
