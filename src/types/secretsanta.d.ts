export type SecretSantaUser = string;

export type SecretSantaConflict = [SecretSantaUser, SecretSantaUser];

export type SecretSantaList = Array<SecretSantaUser>;

export type SecretSantaConflicts = Array<SecretSantaConflict>;

export type SecretSantaMappings = Map<SecretSantaUser, SecretSantaUser | null>;
