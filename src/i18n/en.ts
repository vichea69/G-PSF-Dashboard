// English labels for simple UI text.
export const en = {
  common: {
    cancel: 'Cancel',
    continue: 'Continue'
  },
  confirmDialog: {
    title: 'Are you sure?',
    description: 'This action cannot be undone.'
  },
  table: {
    reset: 'Reset',
    view: 'View',
    searchColumns: 'Search columns...',
    noColumnsFound: 'No columns found.',
    noResults: 'No results.',
    rowsPerPage: 'Rows per page',
    page: 'Page',
    of: 'of',
    totalRowsSuffix: 'row(s) total.',
    selectedRowsSuffix: 'row(s) selected.',
    toggleColumns: 'Toggle columns',
    goToFirstPage: 'Go to first page',
    goToPreviousPage: 'Go to previous page',
    goToNextPage: 'Go to next page',
    goToLastPage: 'Go to last page',
    ascending: 'Asc',
    descending: 'Desc',
    resetSorting: 'Reset',
    hide: 'Hide'
  },
  sidebar: {
    groups: {
      overview: 'Overview',
      contentManagement: 'Content Management',
      siteMenuManagement: 'Site Menu Management',
      administration: 'Administration',
      systemLog: 'System Log'
    },
    items: {
      dashboard: 'Dashboard',
      category: 'Category',
      page: 'Page',
      section: 'Section',
      post: 'Post',
      contact: 'Contact',
      partner: 'Partner',
      testimonial: 'Testimonial',
      workingGroup: 'Working-Group',
      user: 'User',
      role: 'Role',
      siteSetting: 'Site Setting',
      mediaManager: 'Media Manager',
      menuAndFooter: 'Menu and Footer',
      activityLog: 'Activity Log'
    }
  },
  activityLog: {
    title: 'Activity Log',
    description: 'Review recent admin actions in a simple table.',
    event: 'Event',
    activity: 'Activity',
    target: 'Target',
    content: 'Content',
    user: 'User',
    date: 'Date',
    actions: 'Actions',
    searchPlaceholder: 'Search activity...',
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    menuLabel: 'Actions',
    openContent: 'Open Content',
    noContentLink: 'No content link for this log',
    detailDescription: 'Review the full activity log information for this row.',
    module: 'Module',
    email: 'Email'
  },
  category: {
    title: 'Categories',
    description: 'Manage categories',
    addNew: 'Add New',
    createTitle: 'Create Category',
    createDescription: 'Set the category names and descriptions.',
    editTitle: 'Edit Category',
    editDescription: 'Update the category names and descriptions.',
    columns: {
      id: 'ID',
      name: 'Category Title',
      description: 'Description',
      posts: 'Posts',
      sections: 'Sections',
      createdBy: 'Created By',
      updatedAt: 'Updated At',
      actions: 'Actions'
    },
    filters: {
      nameLabel: 'Name',
      searchName: 'Search name...'
    },
    form: {
      englishTab: 'English',
      khmerTab: 'Khmer',
      name: 'Name',
      description: 'Description',
      pages: 'Pages',
      selectPages: 'Select pages',
      searchPages: 'Search pages...',
      noPagesFound: 'No pages found.',
      clearSelection: 'Clear selection',
      more: 'more',
      createSubmit: 'Create Category',
      saveChanges: 'Save Changes',
      createdSuccess: 'Category created successfully',
      updatedSuccess: 'Category updated successfully'
    },
    actions: {
      menuLabel: 'Actions',
      openMenu: 'Open menu',
      update: 'Update',
      delete: 'Delete'
    },
    toast: {
      deleted: 'Category deleted successfully'
    }
  }
} as const;
