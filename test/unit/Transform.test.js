describe('Transform test', function() {
  var jnk = new Junkpile.Engine();

  it('Test engine setup', function() {
    chai.assert(jnk.objects.length !== 0, 'engine was created!');
  });

  var t0 = new Junkpile.components.Transform(jnk, "name", null);

  it('Test Transform construction', function() {
    chai.assert((t0 !== undefined) && (t0 !== null) && (t0.type === Junkpile.components.Transform.getType()), 'Transform constructed!');
  });

  it('Test transform vector initialization', function() {
    chai.assert((t0.position.x == 0) && (t0.position.y == 0) &&
                (t0.velocity.x == 0) && (t0.velocity.y == 0) &&
                (t0.acceleration.x == 0 && t0.acceleration.y == 0) &&
                (t0.scale.x == 1) && (t0.scale.y ==1), 'Vectors initialized!');
  });
});
