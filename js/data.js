// Mock Data and Global State Management
window.App = window.App || {};

(function () {
  const DEFAULT_USER = {
    name: "Alex Water",
    email: "alex@example.com",
    joined: "Jan 2024",
    stats: {
      created: 12,
      printed: 450,
    },
  };

  const DEFAULT_DESIGNS = [
    {
      id: 1,
      name: "Summer Vibes",
      date: "2024-03-15",
      preview:
        "https://via.placeholder.com/300x150/e0f2fe/0369a1?text=Summer+Vibes",
    },
    {
      id: 2,
      name: "Corporate Event",
      date: "2024-03-10",
      preview:
        "https://via.placeholder.com/300x150/f0f9ff/0c4a6e?text=Tech+Conf+2024",
    },
    {
      id: 3,
      name: "Wedding Special",
      date: "2024-02-28",
      preview:
        "https://via.placeholder.com/300x150/fdf4ff/86198f?text=Sarah+%26+John",
    },
  ];

  const COMMUNITY_DESIGNS = [
    {
      id: 101,
      designer: "DesignPro",
      likes: 120,
      preview:
        "https://via.placeholder.com/300x150/fff1f2/9f1239?text=Floral+Pattern",
    },
    {
      id: 102,
      designer: "EcoLife",
      likes: 85,
      preview:
        "https://via.placeholder.com/300x150/ecfccb/3f6212?text=Pure+Spring",
    },
    {
      id: 103,
      designer: "AquaFan",
      likes: 210,
      preview:
        "https://via.placeholder.com/300x150/ecfeff/164e63?text=Glacier+Water",
    },
    {
      id: 104,
      designer: "Minimalist",
      likes: 300,
      preview:
        "https://via.placeholder.com/300x150/f8fafc/0f172a?text=Minimal+White",
    },
  ];

  // Initialize State
  if (!localStorage.getItem("app_user")) {
    localStorage.setItem("app_user", JSON.stringify(DEFAULT_USER));
  }
  if (!localStorage.getItem("app_designs")) {
    localStorage.setItem("app_designs", JSON.stringify(DEFAULT_DESIGNS));
  }

  // Export simplified API
  window.App.Data = {
    getUser: () => JSON.parse(localStorage.getItem("app_user")),
    getDesigns: () => JSON.parse(localStorage.getItem("app_designs")),
    getCommunityDesigns: () => COMMUNITY_DESIGNS,

    addDesign: (design) => {
      const designs = JSON.parse(localStorage.getItem("app_designs"));
      designs.unshift(design);
      localStorage.setItem("app_designs", JSON.stringify(designs));

      // Update stats
      const user = JSON.parse(localStorage.getItem("app_user"));
      user.stats.created++;
      localStorage.setItem("app_user", JSON.stringify(user));
    },

    deleteDesign: (id) => {
      let designs = JSON.parse(localStorage.getItem("app_designs"));
      designs = designs.filter((d) => d.id !== id);
      localStorage.setItem("app_designs", JSON.stringify(designs));
    },
  };
})();
