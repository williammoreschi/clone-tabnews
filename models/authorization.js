function can(user, feature, reource) {
  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && reource) {
    authorized = false;

    if (user.id === reource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }
  return authorized;
}

const authorization = {
  can,
};

export default authorization;
