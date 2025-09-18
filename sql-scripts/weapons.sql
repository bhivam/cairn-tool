-- Enable UUID generation if not already present
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) Weapon classes (including Simple with neutral mastered bonus)
INSERT INTO weapon_classes (
  id,
  name,
  mastered_bonus_attribute,
  mastered_bonus_amount,
  created_at,
  updated_at
)
VALUES
  (gen_random_uuid(), 'Simple',  'NONE', 0, NOW(), NOW()),
  (gen_random_uuid(), 'Polearm', 'VIT',  1, NOW(), NOW()),
  (gen_random_uuid(), 'Sword',   'DEX',  1, NOW(), NOW()),
  (gen_random_uuid(), 'Dagger',  'DEX',  1, NOW(), NOW()),
  (gen_random_uuid(), 'Axe',     'VIT',  1, NOW(), NOW()),
  (gen_random_uuid(), 'Bow',     'DEX',  1, NOW(), NOW()),
  (gen_random_uuid(), 'Hammer',  'VIT',  1, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- 2) Weapons

-- Simple (untrained) weapons
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Quarterstaff',
    (SELECT id FROM weapon_classes WHERE name = 'Simple'),
    1, 6,
    2, NULL, NULL,
    FALSE, 'two_handed',
    'Untrained/simple melee staff. 2-yard reach.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Knife',
    (SELECT id FROM weapon_classes WHERE name = 'Simple'),
    1, 4,
    1, NULL, NULL,
    FALSE, 'one_handed',
    'Untrained/simple small blade. 1-yard reach.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Club',
    (SELECT id FROM weapon_classes WHERE name = 'Simple'),
    1, 8,
    2, NULL, NULL,
    FALSE, 'one_handed',
    'Untrained/simple bludgeon. 2-yard reach.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Sling',
    (SELECT id FROM weapon_classes WHERE name = 'Simple'),
    1, 4,
    NULL, NULL, 30,
    TRUE, 'one_handed',
    'Untrained/simple ranged sling. Effective to ~30 yards.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Polearms
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Spear',
    (SELECT id FROM weapon_classes WHERE name = 'Polearm'),
    1, 10,
    3, NULL, NULL,
    FALSE, 'two_handed',
    'Playstyle: 3 yards range, Two-Handed, Defensive Fighter.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Halberd',
    (SELECT id FROM weapon_classes WHERE name = 'Polearm'),
    1, 10,
    3, NULL, NULL,
    FALSE, 'two_handed',
    'Playstyle: 3 yards range, Two-Handed, CC Fighter.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Glaive',
    (SELECT id FROM weapon_classes WHERE name = 'Polearm'),
    1, 10,
    3, NULL, NULL,
    FALSE, 'two_handed',
    'Playstyle: 3 yards range, Two-Handed, AoE Fighter.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Swords
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Straight Sword',
    (SELECT id FROM weapon_classes WHERE name = 'Sword'),
    1, 8,
    2, NULL, NULL,
    FALSE, 'one_handed',
    'Leaf-blade ~3ft. Playstyle: 2 yards range, One-Handed, reactive duelist.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Khopesh',
    (SELECT id FROM weapon_classes WHERE name = 'Sword'),
    1, 8,
    2, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 2 yards range, One-Handed, armor-shred skirmisher.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Daggers
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Dagger',
    (SELECT id FROM weapon_classes WHERE name = 'Dagger'),
    1, 6,
    1, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 1 yard range, One-Handed, High damage assassin.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Dirk',
    (SELECT id FROM weapon_classes WHERE name = 'Dagger'),
    1, 6,
    1, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 1 yard range, One-Handed, Bleed assassin.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Sickle',
    (SELECT id FROM weapon_classes WHERE name = 'Dagger'),
    1, 6,
    1, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 1 yard range, One-Handed, disabling assassin, CC.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Axes
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Battle Axe',
    (SELECT id FROM weapon_classes WHERE name = 'Axe'),
    1, 10,
    2, NULL, NULL,
    FALSE, 'two_handed',
    'Playstyle: 2 yards range, Two-handed, Barbarian.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Socketed Axe',
    (SELECT id FROM weapon_classes WHERE name = 'Axe'),
    1, 8,
    2, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 2 yards range, One-Handed, Berserker.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Bows
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Longbow',
    (SELECT id FROM weapon_classes WHERE name = 'Bow'),
    1, 12,
    NULL, 60, 120,
    TRUE, 'two_handed',
    'Playstyle: Long range (60-120 yards), power/precision from afar; disadvantage when attacking a target within 30-60 yards (removed by Proficient: Sharpshooter). Weak up close.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Shortbow',
    (SELECT id FROM weapon_classes WHERE name = 'Bow'),
    1, 8,
    NULL, 30, 60,
    TRUE, 'two_handed',
    'Playstyle: Close range (30-60 yards), fast, reactive — excels in confined spaces.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- Hammers
INSERT INTO weapons (
  id, name, class_id, die_count, die_faces,
  reach_yards, range_min_yards, range_max_yards,
  is_ranged, handedness, rules_notes, tags, created_at, updated_at
)
VALUES
  (
    gen_random_uuid(),
    'Disc Mace',
    (SELECT id FROM weapon_classes WHERE name = 'Hammer'),
    1, 8,
    2, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 2 yards range, One-Handed, balanced, shield breaker/armor shred, CC.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Spiked Mace',
    (SELECT id FROM weapon_classes WHERE name = 'Hammer'),
    1, 10,
    2, NULL, NULL,
    FALSE, 'one_handed',
    'Playstyle: 2 yards range, One-Handed, high-damage, single target.',
    '[]'::jsonb, NOW(), NOW()
  ),
  (
    gen_random_uuid(),
    'Battle Hammer',
    (SELECT id FROM weapon_classes WHERE name = 'Hammer'),
    1, 12,
    2, NULL, NULL,
    FALSE, 'two_handed',
    'Playstyle: 2 yards range, Two-Handed, AoE, CC.',
    '[]'::jsonb, NOW(), NOW()
  )
ON CONFLICT (name) DO NOTHING;

-- 3) Weapon traits (Proficient and Mastered)
-- Use WHERE NOT EXISTS to keep this idempotent without a DB unique constraint.

-- Polearms
INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Phalanx Line',
       'When fighting adjacent to another player, you both gain +1 Armor.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Spear'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Phalanx Line'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Sentinel',
       'When an enemy enters your reach, you may immediately make a free attack if you are aware of them.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Spear'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Sentinel'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Hook and Hewer',
       'Once per round, you can forgo damage to trigger a DEX save at disadvantage that when failed causes the opponent to go prone.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Halberd'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Hook and Hewer'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Cleaving Sweep',
       'If you down an enemy, you may make an immediate second damage dealing attack on an adjacent target.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Halberd'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Cleaving Sweep'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Arcing Reach',
       'Can choose to distribute damage to up to 4 adjacent opponents.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Glaive'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Arcing Reach'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Opportunity',
       'Make a free attack on opponents who leave your attack range.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Glaive'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Opportunity'
  );

-- Swords
INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Dueling Stance',
       'While fighting a single enemy in melee (no other combatants or allies adjacent to you or the opponent), you deal +1 damage and reduce all incoming damage by 1.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Straight Sword'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Dueling Stance'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Riposte',
       'When you succeed a dodge against a melee attack, you may immediately make a counterattack.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Straight Sword'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Riposte'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Executioner',
       'Attacks against unarmored opponents deal +1 damage. Shields are not treated as armor for this.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Khopesh'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Executioner'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Hooked Slash',
       'All attacks ignore 1 point of armor. Opponents reduced to 0 armor by Hooked Slash are treated as unarmored for the purposes of Executioner.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Khopesh'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Hooked Slash'
  );

-- Daggers
INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Scalpel',
       'If the enemy is at disadvantage, ignore armor.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Dagger'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Scalpel'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Vital',
       'A successful attack on an opponent with disadvantage will deal double damage.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Dagger'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Vital'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Bleed',
       'Max damage hits cause opponents to take +1 damage at the start of their next turn unless an action is spent to staunch the wound (does not stack).',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Dirk'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Bleed'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Rend',
       'Ignore armor on bleeding opponents.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Dirk'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Rend'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Hamstring',
       'Max damage hits reduce the target’s movement by half for one round.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Sickle'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Hamstring'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Reap',
       'Allies ignore the armor of Hamstrung opponents.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Sickle'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Reap'
  );

-- Axes
INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Shatter Guard',
       'Upon max damage hits, target’s armor is reduced to 0 for a single round.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Battle Axe'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Shatter Guard'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'War Cry',
       'As a turn, trigger a WIS save to fear an opponent up to 5 yards away. The opponent must spend their next action running from you.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Battle Axe'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'War Cry'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Rage',
       'If you are reduced to half max VIT you do not have to roll a WIS save to maintain consciousness and deal +1 damage on attacks.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Socketed Axe'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Rage'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Momentum',
       'Upon a successful attack you can attack once more on an opponent within range.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Socketed Axe'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Momentum'
  );

-- Bows
INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Sharpshooter',
       'Lose close-range penalty (no disadvantage at 30-60 yards).',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Longbow'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Sharpshooter'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Eagle-Eye',
       'Ignore cover (except full cover).',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Longbow'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Eagle-Eye'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Point Blank',
       'When a creature enters your melee range, you can make an immediate attack against them.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Shortbow'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Point Blank'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Quick Draw',
       'If you are not being threatened by an opponent (includes ranged opponents) and you land a successful shot, you may make one more.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Shortbow'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Quick Draw'
  );

-- Hammers
INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Shieldbreaker',
       'When you hit an armored target (non-magic), their armor is reduced by 2 until the end of their next turn.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Disc Mace'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Shieldbreaker'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Knockdown',
       'Max damage hits will cause opponents to fall prone.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Disc Mace'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Knockdown'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Spinal Tap',
       'Max damage attacks ignore armor.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Spiked Mace'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Spinal Tap'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Crushing Blow',
       'Before your turn you can choose to forgo your next turn in order to deal double damage on a successful hit.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Spiked Mace'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Crushing Blow'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'proficient', 'Slam',
       'Upon hitting an opponent, you may immediately choose to deal half damage but force the target to be knocked back 2 yards, causing 1 damage to each opponent directly behind them.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Battle Hammer'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'proficient' AND t.name = 'Slam'
  );

INSERT INTO weapon_traits (id, weapon_id, tier, name, description, created_at, updated_at)
SELECT gen_random_uuid(), w.id, 'mastered', 'Concussive Impact',
       'Upon hitting an opponent choose to distribute damage: the target in front takes half, and the remaining half distributes evenly to up to 3 opponents adjacent to the first.',
       NOW(), NOW()
FROM weapons w
WHERE w.name = 'Battle Hammer'
  AND NOT EXISTS (
    SELECT 1 FROM weapon_traits t
    WHERE t.weapon_id = w.id AND t.tier = 'mastered' AND t.name = 'Concussive Impact'
  );
