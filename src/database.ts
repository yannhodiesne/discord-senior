import Keyv from 'keyv';
import { Configuration } from './conf';

const db = (() => {
	const keyv = new Keyv(Configuration.sqlite.path);

	// eslint-disable-next-line no-console
	keyv.on('error', (err) => console.error('Keyv connection error:', err));

	return keyv;
})();

const get = async <T>(key: string, defaultValue: T): Promise<T> => {
	const value: unknown = await db.get(key);

	if (!value) {
		return defaultValue;
	}

	return JSON.parse(String(value)) as T;
};

const getMap = async <T>(key: string, defaultValue: T): Promise<T> => {
	const value: unknown = await db.get(key);

	if (!value) {
		return defaultValue;
	}

	return new Map(Object.entries(JSON.parse(String(value))!)) as T;
};

const set = async <T>(key: string, value: T) => {
	await db.set(key, JSON.stringify(value));
};

const setMap = async <T>(key: string, value: T) => {
	await db.set(key, JSON.stringify(Object.fromEntries(value as any)));
};

export default {
	get,
	getMap,
	set,
	setMap,
};
