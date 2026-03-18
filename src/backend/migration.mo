import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type OldProblem = {
    question : Text;
    options : [Text];
    correctIndex : Nat;
  };

  type OldUserProgress = {
    score : Nat;
    totalProblemsAnswered : Nat;
    currentLevel : Nat;
  };

  type OldActor = {
    problemsPerLevel : [[OldProblem]];
    usersProgress : Map.Map<Principal, OldUserProgress>;
  };

  type NewActor = { };
  public func run(_old : OldActor) : NewActor { {} };
};
