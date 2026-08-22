/**
 * Configurable weights and thresholds for AI Lost & Found Matching Engine
 */
module.exports = {
  // Weights must sum to 1.0 (100%)
  weights: {
    category: 0.20,         // 20%
    nameDescription: 0.20,  // 20%
    brandModel: 0.15,       // 15%
    color: 0.10,            // 10%
    location: 0.10,         // 10%
    dateTime: 0.10,         // 10%
    imageSimilarity: 0.15,  // 15%
  },

  // Confidence classification thresholds
  thresholds: {
    highMatch: 80,          // 80% - 100% -> High Match
    possibleMatch: 60,      // 60% - 79%  -> Possible Match
    noStrongMatch: 60,      // < 60%      -> No Strong Match
  },

  // Predefined synonyms and taxonomy mappings for campus items
  categoryTaxonomy: {
    'Electronics': ['earbuds', 'earphone', 'headphone', 'airpods', 'laptop', 'charger', 'phone', 'mobile', 'cable', 'powerbank', 'calculator', 'usb', 'mouse', 'ipad', 'tablet'],
    'ID Card': ['id', 'identity', 'badge', 'smart card', 'hall ticket', 'license', 'pass', 'lanyard', 'student id', 'college id'],
    'Water Bottle': ['bottle', 'flask', 'tumbler', 'sipper', 'hydro flask', 'milton', 'thermos'],
    'Notebook': ['notebook', 'book', 'notes', 'record', 'diary', 'journal', 'assignment', 'file', 'folder'],
    'Bag': ['backpack', 'bag', 'pouch', 'sack', 'handbag', 'tote', 'laptop bag', 'duffel', 'kitbag'],
    'Keys': ['keys', 'keychain', 'bike key', 'car key', 'room key', 'locker key', 'dorm key'],
    'Accessories': ['watch', 'smartwatch', 'ring', 'chain', 'bracelet', 'glasses', 'spectacles', 'sunglasses', 'cap', 'hat', 'belt', 'wallet'],
    'Clothing': ['jacket', 'hoodie', 'sweater', 'shirt', 'lab coat', 'apron', 'scarf', 'umbrella'],
  },

  // Campus location groups for proximity scoring
  locationClusters: {
    'academic': ['cse block', 'ece block', 'mech block', 'civil block', 'science block', 'classroom', 'lecture hall', 'department', 'room', 'auditorium', 'drawing hall'],
    'labs': ['computer lab', 'physics lab', 'chemistry lab', 'iot lab', 'ai lab', 'mechanical lab', 'workshop', 'cad lab'],
    'amenities': ['central library', 'library', 'cafeteria', 'canteen', 'student union', 'gym', 'sports complex', 'ground', 'food court'],
    'transit_admin': ['main gate', 'security desk', 'parking', 'bus stand', 'admin block', 'principal office', 'reception'],
  }
};
