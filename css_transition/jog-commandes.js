useEffect(() => {
  // Nettoyage précédent si nécessaire
  const cleanup = () => {
    // On peut laisser vide ou ajouter removeEventListener si tu veux être très propre
  };

  const attach = (id, handlers) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (handlers.down) el.addEventListener('mousedown', handlers.down);
    if (handlers.up) el.addEventListener('mouseup', handlers.up);
    if (handlers.out) el.addEventListener('mouseout', handlers.out);
    if (handlers.over) el.addEventListener('mouseover', handlers.over);
  };

  // === Home buttons ===
  attach("HomeAll", {
    down: () => onMouseDown("HomeAll"),
    up: () => sendHomeCommand("", "HomeAll"),
    out: () => onOut("HomeAll")
  });

  attach("HomeX", {
    down: () => onMouseDown("HomeX"),
    up: () => sendHomeCommand("X", "HomeX"),
    out: () => onOut("HomeX")
  });

  attach("HomeY", {
    down: () => onMouseDown("HomeY"),
    up: () => sendHomeCommand("Y", "HomeY"),
    out: () => onOut("HomeY")
  });

  attach("HomeZ", {
    down: () => onMouseDown("HomeZ"),
    up: () => sendHomeCommand("Z", "HomeZ"),
    out: () => onOut("HomeZ")
  });

  // === Jog circles (factorisé) ===
  const jogSizes = ['100', '10', '1', '0_1'];
  const directions = [
    { prefix: 'V_top',    axis: V_axis, dist: (s) => V_axis_top_dir + s.replace('_', '.') },
    { prefix: 'H_right',  axis: H_axis, dist: (s) => H_axis_right_dir + s.replace('_', '.') },
    { prefix: 'V_bottom', axis: V_axis, dist: (s) => V_axis_bottom_dir + s.replace('_', '.') },
    { prefix: 'H_left',   axis: H_axis, dist: (s) => H_axis_left_dir + s.replace('_', '.') },
  ];

  jogSizes.forEach(size => {
    directions.forEach(dir => {
      const btnId = `${dir.prefix}_${size}`;
      const labelId = size === '0_1' ? 'label_circle_0_1' : `label_circle_${size}`;

      attach(btnId, {
        down: () => onMouseDown(btnId),
        up: () => sendJogCommand(dir.axis, btnId, dir.dist(size)),
        out: () => onOutJog(labelId, btnId),
        over: () => onHoverJog(labelId)
      });
    });
  });

  // === Z Bar buttons ===
  const zDirections = [
    { id: 'Z_top_100',    dist: Z_axis_top_dir + '100' },
    { id: 'Z_top_10',     dist: Z_axis_top_dir + '10' },
    { id: 'Z_top_1',      dist: Z_axis_top_dir + '1' },
    { id: 'Z_top_0_1',    dist: Z_axis_top_dir + '0.1' },
    { id: 'Z_bottom_0_1', dist: Z_axis_bottom_dir + '0.1' },
    { id: 'Z_bottom_1',   dist: Z_axis_bottom_dir + '1' },
    { id: 'Z_bottom_10',  dist: Z_axis_bottom_dir + '10' },
    { id: 'Z_bottom_100', dist: Z_axis_bottom_dir + '100' },
  ];

  zDirections.forEach(z => {
    const labelId = z.id.includes('100') ? 'z100' : 
                    z.id.includes('10') ? 'z10' : 
                    z.id.includes('1') && !z.id.includes('0_1') ? 'z1' : 'z0_1';

    attach(z.id, {
      down: () => onMouseDown(z.id),
      up: () => sendJogCommand(Z_axis, z.id, z.dist),
      out: () => onOutJog(labelId, z.id),
      over: () => onHoverJog(labelId)
    });
  });

  // === Centre posxy et posz ===
  attach("posxy", {
    down: () => onMouseDown("posxy"),
    up: () => sendMoveCommand("posxy", "posxy"),
    out: () => onOut("posxy"),
    over: () => onHoverJog("posxy")
  });

  attach("posz", {
    down: () => onMouseDown("posz"),
    up: () => sendMoveCommand("posz", "posz"),
    out: () => onOut("posz"),
    over: () => onHoverJog("posz")
  });

  return cleanup;
}, [V_axis, H_axis, V_axis_top_dir, V_axis_bottom_dir, H_axis_left_dir, H_axis_right_dir, Z_axis_top_dir, Z_axis_bottom_dir, moveToTitleXY, moveToTitleZ]);
