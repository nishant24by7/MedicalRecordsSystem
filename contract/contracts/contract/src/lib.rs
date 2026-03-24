#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Bytes, Env
};

#[contract]
pub struct MedicalRecords;

// Storage keys
#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Record(u32),
    Owner(u32),
    Counter,
}

// Medical Record struct
#[contracttype]
#[derive(Clone)]
pub struct Record {
    pub data: Bytes,   // Encrypted / raw medical data
}

#[contractimpl]
impl MedicalRecords {

    // 📌 Add new medical record
    pub fn add_record(env: Env, patient: Address, data: Bytes) -> u32 {
        patient.require_auth();

        let mut counter: u32 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0);

        counter += 1;

        let record = Record { data };

        env.storage().instance().set(&DataKey::Record(counter), &record);
        env.storage().instance().set(&DataKey::Owner(counter), &patient);
        env.storage().instance().set(&DataKey::Counter, &counter);

        counter
    }

    // 📌 Get medical record (only owner can access)
    pub fn get_record(env: Env, id: u32, caller: Address) -> Bytes {
        caller.require_auth();

        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(id))
            .unwrap();

        if caller != owner {
            panic!("Unauthorized access");
        }

        let record: Record = env
            .storage()
            .instance()
            .get(&DataKey::Record(id))
            .unwrap();

        record.data
    }

    // 📌 Update record (only owner)
    pub fn update_record(env: Env, id: u32, caller: Address, new_data: Bytes) {
        caller.require_auth();

        let owner: Address = env
            .storage()
            .instance()
            .get(&DataKey::Owner(id))
            .unwrap();

        if caller != owner {
            panic!("Unauthorized");
        }

        let updated = Record { data: new_data };

        env.storage().instance().set(&DataKey::Record(id), &updated);
    }

    // 📌 Get record owner
    pub fn get_owner(env: Env, id: u32) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Owner(id))
            .unwrap()
    }
}