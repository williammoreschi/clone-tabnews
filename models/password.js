import bcryptjs from "bcryptjs";

async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password, rounds);
}
async function compare(providedPassword, storedPassword) {
  return await bcryptjs.compare(providedPassword, storedPassword);
}

function getNumberOfRounds() {
  let rounds = 1;
  const env = process.env.NODE_ENV || "development";
  if (env === "production") {
    rounds = 14;
  }
  return rounds;
}

const password = {
  hash,
  compare,
};

export default password;
