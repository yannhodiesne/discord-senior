export type SecretSantaUser = string;

export type SecretSantaDrama = [SecretSantaUser, SecretSantaUser];

export type SecretSantaList = Array<SecretSantaUser>;

export type SecretSantaDramas = Array<SecretSantaDrama>;

export type SecretSantaMappings = Map<SecretSantaUser, SecretSantaUser | null>;
